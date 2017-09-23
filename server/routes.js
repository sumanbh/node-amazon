const format = require('./pg-format/index');
const pool = require('./connection');

const routes = {
    getAllProducts: async (req, res) => {
        const offset = (parseInt(req.params.page, 10) - 1) * 24;
        const limit = 24;
        const obj = JSON.parse(req.query.obj);
        const list = Object.keys(obj);
        let brands = [];
        let os = [];
        let processor = [];
        let storage = [];
        let ram = [];
        let min = 0;
        let max = 20000;
        let search = '';

        // get min and max if they exist
        if (req.query.min) min = parseInt(req.query.min, 10) || 0;
        if (req.query.max) max = parseInt(req.query.max, 10) || 20000;

        // get rest of the filter variables
        list.forEach((value) => {
            switch (value) {
                case 'brand': {
                    const keys = Object.keys(obj[value]);
                    brands = keys.filter(key => obj[value][key]);
                    break;
                }
                case 'os': {
                    const keys = Object.keys(obj[value]);
                    os = keys.filter(key => obj[value][key]);
                    break;
                }
                case 'processor': {
                    const keys = Object.keys(obj[value]);
                    processor = keys.filter(key => obj[value][key]);
                    break;
                }
                case 'ram': {
                    const keys = Object.keys(obj[value]);
                    ram = keys.filter(key => obj[value][key]);
                    break;
                }
                case 'storage': {
                    const keys = Object.keys(obj[value]);
                    storage = keys.filter(key => obj[value][key]);
                    break;
                }
                case 'search': {
                    const searchTerm = obj[value];
                    if (searchTerm) {
                        search = `${searchTerm}`.toLowerCase();
                    }
                    break;
                }
                default:
                /* do nothing */
            }
        });
        let query = `
            SELECT laptops.id, laptops.img, laptops.price, laptops.rating, laptops.name FROM laptops
            JOIN brand ON laptops.brand_id = brand.id
            JOIN os ON laptops.os_id = os.id
            JOIN processor ON laptops.processor_id = processor.id
            JOIN storage_type ON laptops.storage_type_id = storage_type.id
            WHERE ($1 = '' OR LOWER(brand.name) = ANY(STRING_TO_ARRAY(LOWER($1), ',')))
            AND ($2 = '' OR LOWER(os.name) = ANY(STRING_TO_ARRAY(LOWER($2), ',')))
            AND ($3 = '' OR laptops.ram = ANY(STRING_TO_ARRAY($3, ',')))
            AND ($4 = '' OR LOWER(processor.name) = ANY(STRING_TO_ARRAY(LOWER($4), ',')))
            AND ($5 = '' OR LOWER(storage_type.name) = ANY(STRING_TO_ARRAY(LOWER($5), ',')))
            AND laptops.price >= ($6) 
            AND laptops.price < ($7)
            `;
        const parameters = [brands.join(','), os.join(','), ram.join(','), processor.join(','), storage.join(','), min, max];

        if (search) {
            // use translate function to remove dashes from our search for better results
            query += `AND TRANSLATE(LOWER(laptops.name), '-', ' ') LIKE $8
                    ORDER BY laptops.rating DESC;
                    `;
            parameters.push(`%${search.replace(/-/g, ' ').trim() || ' '}%`);
        } else {
            query += 'ORDER BY laptops.rating DESC;';
        }

        const result = await pool.query(query, parameters);
        res.status(200).json({
            total: result.rowCount,
            data: result.rows.splice(offset, limit), // pagination
        });
    },
    getCartCount: id => new Promise(async (resolve) => {
        const query = 'SELECT SUM(product_quantity) as total FROM cartview WHERE customer_id = $1;';
        resolve((await pool.query(query, [id])).rows[0]);
    }),
    getProductById: async (req, res) => {
        const id = parseInt(req.params.productId, 10);
        // get the main product
        let query = `
            SELECT laptops.id, laptops.name AS laptop_name, laptops.img, laptops.ram, laptops.storage, laptops.img_big, laptops.price, laptops.rating, laptops.description, os.name AS os_name, brand.name AS brand_name, storage_type.name AS storage_name FROM laptops
            JOIN brand ON laptops.brand_id = brand.id
            JOIN os ON laptops.os_id = os.id
            JOIN storage_type ON laptops.storage_type_id = storage_type.id
            WHERE laptops.id = $1;
            `;
        let mainProduct = (await pool.query(query, [id]));
        // if no result send 404 status
        if (mainProduct.rowCount === 0) return res.status(404).json({ success: false });
        mainProduct = mainProduct.rows;
        // find similar product based on price
        const price = parseInt(mainProduct[0].price, 10);
        const mainId = parseInt(mainProduct[0].id, 10);
        query = `
            SELECT laptops.id, laptops.name AS laptop_name, laptops.rating, laptops.img, laptops.price, laptops.ram, laptops.storage, os.name AS os_name, brand.name AS brand_name, storage_type.name AS storage_name FROM laptops
            JOIN brand ON laptops.brand_id = brand.id
            JOIN os ON laptops.os_id = os.id
            JOIN storage_type ON laptops.storage_type_id = storage_type.id
            WHERE laptops.price <= ($1 + 150) AND laptops.price >= ($1 - 250)
            AND laptops.id <> $2;
            `;
        const similarProducts = (await pool.query(query, [price, mainId])).rows.splice(0, 3);
        res.status(200).json({
            product: mainProduct,
            similar: similarProducts,
        });
    },
    addToCart: async (req, res) => {
        const id = parseInt(req.body.productId, 10) || 0;
        const quantity = parseInt(req.body.productQuantity, 10) || 0;
        if (id === 0 || quantity <= 0) return res.status(200).json({ success: false });
        let results = [];
        // checks to see if the product already exists in the cart
        const query = 'SELECT * FROM cart WHERE product_id = $1 AND customer_id = $2;';
        results.push(pool.query(query, [id, req.user.id]), routes.getCartCount(req.user.id));
        results = await Promise.all(results);
        // insert the product if it doesn't already exist
        if (results[0].rowCount === 0) {
            const insertQuery = 'INSERT INTO cart(product_id, product_quantity, customer_id) VALUES ($1, $2, $3);';
            await pool.query(insertQuery, [id, quantity, req.user.id]);
            const cartCount = parseInt(results[1].total || 0, 10) + quantity;
            res.status(200).json({ cart: cartCount || 0, success: true });
        } else {
            // if it exists update its count
            const updateQuery = 'UPDATE cart SET product_quantity = ($1) WHERE customer_id = ($2) and product_id = ($3);';
            const newLength = results[0].rows[0].product_quantity + quantity;
            const cartCount = parseInt(results[1].total || 0, 10) + quantity;
            await pool.query(updateQuery, [newLength, req.user.id, id]);
            res.status(200).json({ cart: cartCount || 0, success: true });
        }
    },
    getFromCart: async (req, res) => {
        // returns everything in the cart if any
        const query = 'SELECT * FROM cartview WHERE customer_id = $1 ORDER BY date_added DESC;';
        const cart = await pool.query(query, [req.user.id]);
        // check if cart is empty
        if (cart.rowCount === 0) return res.status(200).json(cart.rows);
        let results = [];
        const sumQuery = 'SELECT SUM(price * product_quantity) AS total FROM cartview WHERE customer_id = $1;';
        results.push(pool.query(sumQuery, [req.user.id]), routes.getCartCount(req.user.id));
        results = await Promise.all(results);
        // results
        const sum = results[0].rows[0];
        const cartTotal = results[1].total;
        res.status(200).json({
            sum,
            data: cart.rows,
            cart: cartTotal || 0,
        });
    },
    getCheckoutInfo: async (req, res) => {
        // get cart information
        const query = 'SELECT * FROM cartview WHERE customer_id = $1 ORDER BY date_added DESC;';
        const cart = await pool.query(query, [req.user.id]);
        // check if cart is empty
        if (cart.rowCount === 0) return res.status(200).json(cart.rows);
        let results = [];
        // sum the cart
        const sumQuery = 'SELECT SUM(price * product_quantity) AS total FROM cartview WHERE customer_id = $1;';
        // get user information
        const userQuery = 'SELECT address, city, fullname, state, zip FROM customers WHERE id = $1;';
        // run the query
        results.push(pool.query(sumQuery, [req.user.id]), pool.query(userQuery, [req.user.id]));
        results = await Promise.all(results);
        // results
        const sum = results[0].rows[0];
        const userInfo = results[1].rows;
        res.status(200).json({
            sum,
            userInfo,
            data: cart.rows,
        });
    },
    checkoutConfirm: async (req, res) => {
        const userName = req.body.fullname;
        const userAddress = req.body.address;
        const userCity = req.body.city;
        const userState = req.body.state;
        const userZip = req.body.zip;

        let query = `
            SELECT * FROM cart WHERE customer_id = $1;
            `;
        const cart = (await pool.query(query, [req.user.id]));
        // check if cart is empty
        if (cart.rowCount === 0) return res.sendStatus(204);
        // create a unique orderline for checkout
        query = `
                INSERT INTO orderline(customer_id, order_total) VALUES($1, (SELECT SUM(price * product_quantity) FROM cartview WHERE customer_id = $1)) RETURNING orderline.id;
                `;
        const orderline = (await pool.query(query, [req.user.id])).rows[0].id;
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
        await Promise.all(results);
        // send success status
        res.status(200).json({ cart: 0, success: true });
    },
    getUserOrders: async (req, res) => {
        const query = `
            SELECT laptops.id AS laptop_id, laptops.name AS laptop_name, laptops.img, laptops.price, orderline.id, orderline.order_total, orderline.date_added, orders.quantity, orders.fullname, orders.address, orders.city, orders.state, orders.zip
            FROM orders
            JOIN laptops on laptops.id = orders.product_id
            JOIN orderline on orderline.id = orders.orderline_id
            WHERE orderline.customer_id = $1
            ORDER BY orderline.date_added DESC;
            `;
        const result = (await pool.query(query, [req.user.id])).rows;
        res.status(200).json(result);
    },
    removeFromCart: async (req, res) => {
        const uniqueId = parseInt(req.params.id, 10);
        // delete from cart based on id
        const query = 'DELETE FROM cart WHERE customer_id = $1 AND id = $2;';
        await pool.query(query, [req.user.id, uniqueId]);
        const result = await routes.getCartCount(req.user.id);
        res.status(200).json({ cart: result.total || 0, success: true });
    },
    getOrderById: async (req, res) => {
        // ENDPOINT NOT BEING USED CURRENTLY
        const orderId = req.params.id;
        const query = `
            SELECT laptops.id AS laptop_id, laptops.name AS laptop_name, laptops.img, laptops.price, orderline.id, orderline.order_total, orderline.date_added, orderline.order_total, orderline.date_added, orders.quantity, orders.fullname, orders.address, orders.city, orders.state, orders.zip
            FROM orders
            JOIN laptops ON laptops.id = orders.product_id
            JOIN orderline ON orderline.id = orders.orderline_id
            WHERE orderline.customer_id = $1
            AND orders.orderline_id = $2;
            `;
        const result = (await pool.query(query, [req.user.id, orderId])).rows;
        res.status(200).json({
            data: result,
            one: result.slice(0, 1),
        });
    },
    getUserInfo: async (req, res) => {
        const query = `
            SELECT customers.given_name, customers.fullname, customers.address, customers.city, customers.state, customers.zip, customers.phone, customers.date_added FROM customers
            WHERE customers.id = $1
            LIMIT 1;
            `;
        const result = (await pool.query(query, [req.user.id])).rows;
        res.status(200).json(result);
    },
    updateProfile: async (req, res) => {
        const givenName = req.body.given_name;
        const fullname = req.body.fullname;
        const address = req.body.address;
        const city = req.body.city;
        const state = req.body.state;
        const zip = req.body.zip;
        if (givenName && fullname && address && city && state && zip) {
            const query = 'UPDATE customers SET given_name = $1, fullname = $2, address = $3, city = $4, state = $5, zip = $6 WHERE id = $7;';
            await pool.query(query, [givenName, fullname, address, city, state, zip, req.user.id]);
            res.sendStatus(200);
        } else {
            res.sendStatus(400);
        }
    },
};

module.exports = routes;
