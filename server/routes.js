const Pool = require('pg').Pool;
const co = require('co');
const format = require('pg-format');
const config = require('../config/amazon.json');

const pool = new Pool(config.postgresql);
const brandName = {
    Asus: 'Asus',
    Acer: 'Acer',
    Apple: 'Apple',
    HP: 'HP',
    Microsoft: 'Microsoft',
    Lenovo: 'Lenovo',
    Dell: 'Dell',
    Samsung: 'Samsung',
};
const osName = {
    Mac: 'Mac OS X',
    Win10: 'Windows 10',
    Chrome: 'Chrome OS',
    Win8: 'Windows 8.1',
    Win7: 'Windows 7 Home',
};
const processorName = {
    i7: 'Intel Core i7',
    i5: 'Intel Core i5',
    i3: 'Intel Core i3',
    Core2: 'Intel Core 2',
    Athlon: 'AMD',
};
const storageName = {
    SSD: 'SSD',
    HardDrive: 'Hard Disk',
};
const priceName = {
    isUnder500: { min: 0, max: 500 },
    is500to600: { min: 500, max: 600 },
    is600to700: { min: 600, max: 700 },
    is700to800: { min: 700, max: 800 },
    is800to900: { min: 800, max: 900 },
    is900to1000: { min: 900, max: 1000 },
    isAbove1000: { min: 1000, max: 20000 },
};
const ramName = {
    is64andAbove: '64', is32: '32', is16: '16', is8: '8', is4: '4', is2: '2', is12: '12',
};

const routes = {
    getAllProducts: (req, res) => {
        const offset = (parseInt(req.params.page, 10) - 1) * 24;
        const limit = 24;
        const obj = JSON.parse(req.query.obj);
        const brandCollector = [];
        const osCollector = [];
        const processorCollector = [];
        const storageCollector = [];
        const ramCollector = [];
        let min;
        let max;

        const keys = Object.keys(obj);
        const filtered = keys.filter(key => obj[key]);

        filtered.forEach((value) => {
            if (brandName[value]) {
                brandCollector.push(brandName[value]);
            } else if (osName[value]) {
                osCollector.push(osName[value]);
            } else if (processorName[value]) {
                processorCollector.push(processorName[value]);
            } else if (storageName[value]) {
                storageCollector.push(storageName[value]);
            } else if (ramName[value]) {
                ramCollector.push(ramName[value]);
            } else if (priceName[value]) {
                min = priceName[value].min;
                max = priceName[value].max;
            }
        });

        if (req.query.min && req.query.max) {
            min = parseInt(req.query.min, 10) || 0;
            max = parseInt(req.query.max, 10) || 20000;
        } else if (!min && !max) {
            min = 0;
            max = 20000;
        }
        const brand = brandCollector.join(',');
        const os = osCollector.join(',');
        const ram = ramCollector.join(',');
        const processor = processorCollector.join(',');
        const storage = storageCollector.join(',');

        co(function* generator() {
            const query = `
                SELECT laptops.id, laptops.img, laptops.price, laptops.rating, laptops.name FROM laptops
                join brand ON laptops.brand_id = brand.id
                join os ON laptops.os_id = os.id
                join processor ON laptops.processor_id = processor.id
                join storage_type ON laptops.storage_type_id = storage_type.id
                WHERE ($1 = '' OR brand.name = ANY(STRING_TO_ARRAY($1, ',')))
                AND ($2 = '' OR os.name = ANY(STRING_TO_ARRAY($2, ',')))
                AND ($3 = '' OR laptops.ram = ANY(STRING_TO_ARRAY($3, ',')))
                AND ($4 = '' OR processor.name = ANY(STRING_TO_ARRAY($4, ',')))
                AND ($5 = '' OR storage_type.name = ANY(STRING_TO_ARRAY($5, ',')))
                AND laptops.price >= ($6) 
                AND laptops.price < ($7);
                `;
            const result = yield pool.query(query, [brand, os, ram, processor, storage, min, max]);
            res.json({
                total: result.rowCount,
                data: result.rows.splice(offset, limit), // pagination
            });
        });
    },
    getCartCount: id => new Promise((resolve) => {
        co(function* generator() {
            const query = 'SELECT SUM(product_quantity) as total FROM cartview WHERE customer_id = $1;';
            resolve((yield pool.query(query, [id])).rows[0]);
        });
    }),
    getProductById: (req, res) => {
        const id = parseInt(req.params.productId, 10);
        co(function* generator() {
            // get the main product
            let query = `
                SELECT laptops.id, laptops.name AS laptop_name, laptops.img, laptops.ram, laptops.storage, laptops.img_big, laptops.price, laptops.rating, laptops.description, os.name AS os_name, brand.name AS brand_name, storage_type.name AS storage_name from laptops
                JOIN brand ON laptops.brand_id = brand.id
                JOIN os ON laptops.os_id = os.id
                JOIN storage_type ON laptops.storage_type_id = storage_type.id
                WHERE laptops.id = $1;
                `;
            let mainProduct = (yield pool.query(query, [id]));
            // if no result send 404 status
            if (mainProduct.rowCount === 0) res.sendStatus(404);
            mainProduct = mainProduct.rows;
            // find similar product based on price
            const price = parseInt(mainProduct[0].price, 10);
            const mainId = parseInt(mainProduct[0].id, 10);
            query = `
                SELECT laptops.id, laptops.name AS laptop_name, laptops.rating, laptops.img, laptops.price, laptops.ram, laptops.storage, os.name AS os_name, brand.name AS brand_name, storage_type.name AS storage_name from laptops
                JOIN brand ON laptops.brand_id = brand.id
                JOIN os ON laptops.os_id = os.id
                JOIN storage_type ON laptops.storage_type_id = storage_type.id
                WHERE laptops.price <= ($1 + 150) AND laptops.price >= ($1 - 250)
                AND laptops.id <> $2;
                `;
            const similarProducts = (yield pool.query(query, [price, mainId])).rows.splice(0, 3);
            res.status(200).json({
                product: mainProduct,
                similar: similarProducts,
            });
        });
    },
    addToCart: (req, res) => {
        const id = parseInt(req.body.productId, 10) || 0;
        const quantity = parseInt(req.body.productQuantity, 10) || 0;
        if (!req.user || id === 0 || quantity === 0) res.sendStatus(404);
        else {
            co(function* generator() {
                let results = [];
                // checks to see if the product already exists in the cart
                const query = `
                    SELECT * FROM cart WHERE product_id = $1 AND customer_id = $2;
                    `;
                results.push(pool.query(query, [id, req.user.id]), routes.getCartCount(req.user.id));
                results = yield Promise.all(results);
                // insert the product if it doesn't already exist
                if (results[0].rowCount === 0) {
                    const insertQuery = `
                        INSERT INTO cart(product_id, product_quantity, customer_id) VALUES ($1, $2, $3);
                        `;
                    yield pool.query(insertQuery, [id, quantity, req.user.id]);
                    const cartCount = parseInt(results[1].total || 0, 10) + quantity;
                    res.status(200).json({ cart: cartCount || 0, success: true });
                } else {
                    // if it exists update it's count
                    const newLength = results[0].rows[0].product_quantity + quantity;
                    const updateQuery = `
                        UPDATE cart SET product_quantity = ($1) WHERE customer_id = ($2) and product_id = ($3);
                        `;
                    const cartCount = parseInt(results[1].total || 0, 10) + quantity;
                    yield pool.query(updateQuery, [newLength, req.user.id, id]);
                    res.status(200).json({ cart: cartCount || 0, success: true });
                }
            });
        }
    },
    getFromCart: (req, res) => {
        if (!req.user) res.sendStatus(401);
        else {
            co(function* generator() {
                // returns everything in the cart if any
                const query = `
                    SELECT * from cartview WHERE customer_id = $1 ORDER BY date_added DESC;
                    `;
                const cart = yield pool.query(query, [req.user.id]);
                if (cart.rowCount > 0) {
                    let results = [];
                    const sumQuery = `
                        SELECT SUM(price * product_quantity) AS total FROM cartview WHERE customer_id = $1;
                        `;
                    results.push(pool.query(sumQuery, [req.user.id]), routes.getCartCount(req.user.id));
                    results = yield Promise.all(results);
                    // results
                    const sum = results[0].rows[0];
                    const cartTotal = results[1].total;
                    res.status(200).json({
                        sum,
                        data: cart.rows,
                        cart: cartTotal || 0,
                    });
                } else res.status(200).json(cart.rows);
            });
        }
    },
    getCheckoutInfo: (req, res) => {
        if (!req.user) res.sendStatus(401);
        else {
            co(function* generator() {
                // get cart information
                const query = `
                    SELECT * from cartview WHERE customer_id = $1 ORDER BY date_added DESC;
                    `;
                const cart = yield pool.query(query, [req.user.id]);
                if (cart.rowCount > 0) {
                    let results = [];
                    // sum the cart
                    const sumQuery = 'SELECT SUM(price * product_quantity) AS total FROM cartview WHERE customer_id = $1;';
                    // get user information
                    const userQuery = 'SELECT * FROM customers WHERE id = $1;';
                    // run the query
                    results.push(pool.query(sumQuery, [req.user.id]), pool.query(userQuery, [req.user.id]));
                    results = yield Promise.all(results);
                    // results
                    const sum = results[0].rows[0];
                    const userInfo = results[1].rows;
                    res.status(200).json({
                        sum,
                        userInfo,
                        data: cart.rows,
                    });
                } else res.status(200).json(cart.rows);
            });
        }
    },
    checkoutConfirm: (req, res) => {
        const userName = req.body.fullname;
        const userAddress = req.body.address;
        const userCity = req.body.city;
        const userState = req.body.state;
        const userZip = req.body.zip;

        if (!req.user) res.sendStatus(401);
        else {
            co(function* generator() {
                let query = `
                    SELECT * FROM cart WHERE customer_id = $1;
                    `;
                const cart = (yield pool.query(query, [req.user.id]));
                // check to see if cart is not empty
                if (cart.rowCount > 0) {
                    // create a unique orderline for checkout
                    query = `
                        INSERT INTO orderline(customer_id, order_total) VALUES($1, (SELECT SUM(price * product_quantity) FROM cartview WHERE customer_id = $1)) RETURNING orderline.id;
                        `;
                    const orderline = (yield pool.query(query, [req.user.id])).rows[0].id;
                    // insert the individual cart item to orders table
                    const values = [];
                    cart.rows.forEach(item => values.push([orderline, item.product_id, item.product_quantity, userName, userAddress, userCity, userState, userZip]));
                    const results = [];
                    // insert into orderline
                    const orderlineQuery = format('INSERT INTO orders(orderline_id, product_id, quantity, fullname, address, city, state, zip) VALUES %L', values);
                    // clear the cart
                    const deleteCartQuery = 'DELETE FROM cart WHERE id IN (SELECT id FROM cart WHERE customer_id = $1);';
                    // run the query
                    results.push(pool.query(orderlineQuery), pool.query(deleteCartQuery, [req.user.id]));
                    yield Promise.all(results);
                    // send success status
                    res.status(200).json({ cart: 0, success: true });
                } else res.sendStatus(204);
            });
        }
    },
    getUserOrders: (req, res) => {
        if (!req.user) res.sendStatus(401);
        else {
            co(function* generator() {
                const query = `
                    SELECT laptops.id AS laptop_id, laptops.name AS laptop_name, laptops.img, laptops.price, orderline.id, orderline.order_total, orderline.date_added, orderline.order_total, orderline.date_added, orders.quantity, orders.fullname, orders.address, orders.city, orders.state, orders.zip
                    FROM orders
                    JOIN laptops on laptops.id = orders.product_id
                    JOIN orderline on orderline.id = orders.orderline_id
                    WHERE orderline.customer_id = $1
                    ORDER BY orderline.date_added DESC;
                    `;
                const result = (yield pool.query(query, [req.user.id])).rows;
                res.status(200).json(result);
            });
        }
    },
    removeFromCart: (req, res) => {
        if (!req.user) res.sendStatus(401);
        else {
            const uniqueId = parseInt(req.params.id, 10);
            co(function* generator() {
                // delete from cart based on id
                const query = `
                    DELETE FROM cart WHERE customer_id = $1 AND id = $2;
                    `;
                yield pool.query(query, [req.user.id, uniqueId]);
                const result = yield routes.getCartCount(req.user.id);
                res.status(200).json({ cart: result.total || 0, success: true });
            });
        }
    },
    getOrderById: (req, res) => {
        // ENDPOINT NOT BEING USED CURRENTLY
        if (!req.user) res.sendStatus(401);
        else {
            const orderId = req.params.id;
            co(function* generator() {
                const query = `
                    SELECT laptops.id AS laptop_id, laptops.name AS laptop_name, laptops.img, laptops.price, orderline.id, orderline.order_total, orderline.date_added, orderline.order_total, orderline.date_added, orders.quantity, orders.fullname, orders.address, orders.city, orders.state, orders.zip
                    FROM orders
                    JOIN laptops ON laptops.id = orders.product_id
                    JOIN orderline ON orderline.id = orders.orderline_id
                    WHERE orderline.customer_id = $1
                    AND orders.orderline_id = $2;
                    `;
                const result = (yield pool.query(query, [req.user.id, orderId])).rows;
                res.status(200).json({
                    data: result,
                    one: result.slice(0, 1),
                });
            });
        }
    },
    getUserInfo: (req, res) => {
        if (!req.user) res.sendStatus(401);
        else {
            co(function* generator() {
                const query = `
                    SELECT customers.given_name, customers.fullname, customers.address, customers.city, customers.state, customers.zip, customers.phone, customers.date_added from customers
                    WHERE customers.id = $1
                    LIMIT 1;
                    `;
                const result = (yield pool.query(query, [req.user.id])).rows;
                res.status(200).json(result);
            });
        }
    },
    updateProfile: (req, res) => {
        if (!req.user) res.sendStatus(401);
        else {
            const givenName = req.body.given_name;
            const fullname = req.body.fullname;
            const address = req.body.address;
            const city = req.body.city;
            const state = req.body.state;
            const zip = req.body.zip;
            if (givenName && fullname && address && city && state && zip) {
                co(function* generator() {
                    const query = `
                    UPDATE customers SET given_name = ($1), fullname = ($2), address = ($3), city = ($4), state = ($5), zip = ($6) WHERE id = ($7);
                    `;
                    yield pool.query(query, [givenName, fullname, address, city, state, zip, req.user.id]);
                    res.sendStatus(200);
                });
            } else {
                res.sendStatus(400);
            }
        }
    },
};

module.exports = routes;
