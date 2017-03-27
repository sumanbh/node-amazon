const app = require('./index.js');

const db = app.get('db');
const brandName = {
    isAsus: 'Asus',
    isAcer: 'Acer',
    isApple: 'Apple',
    isHP: 'HP',
    isMicrosoft: 'Microsoft',
    isLenovo: 'Lenovo',
    isDell: 'Dell',
    isSamsung: 'Samsung',
};
const osName = {
    isMac: 'Mac OS X',
    isWin10: 'Windows 10',
    isChrome: 'Chrome OS',
    isWin8: 'Windows 8.1',
    isWin7: 'Windows 7 Home',
};
const processorName = {
    isInteli7: 'Intel Core i7',
    isInteli5: 'Intel Core i5',
    isInteli3: 'Intel Core i3',
    isIntelCore2: 'Intel Core 2',
    isAMDAthlon: 'AMD',
};
const storageName = {
    isSSD: 'SSD',
    isHardDrive: 'Hard Disk',
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

module.exports = {
    getAllProducts: (req, res) => {
        const offset = (parseInt(req.params.page, 10) - 1) * 24;
        const limit = 24;
        const obj = JSON.parse(req.query.obj);
        const brandCollector = [];
        const osCollector = [];
        const processorCollector = [];
        const storageCollector = [];
        const ramCollector = [];
        const minCollector = [];
        const maxCollector = [];
        let min;
        let max;

        const keys = Object.keys(obj);
        const filtered = keys.filter(key => obj[key]);

        filtered.forEach((value) => {
            switch (value) {
            case (brandName[value] !== undefined ? value : false):
                brandCollector.push(brandName[value]);
                break;
            case (osName[value] !== undefined ? value : false):
                osCollector.push(osName[value]);
                break;
            case (processorName[value] !== undefined ? value : false):
                processorCollector.push(processorName[value]);
                break;
            case (storageName[value] !== undefined ? value : false):
                storageCollector.push(storageName[value]);
                break;
            case (priceName[value] !== undefined ? value : false):
                minCollector.push(priceName[value].min);
                maxCollector.push(priceName[value].max);
                break;
            case (ramName[value] !== undefined ? value : false):
                ramCollector.push(ramName[value]);
                break;
            default:
            }
        });

        if (req.query.min && req.query.max) {
            min = parseInt(req.query.min, 10);
            max = parseInt(req.query.max, 10);
        } else if (minCollector.length >= 1 || maxCollector.length >= 1) {
            min = Math.min(...minCollector);
            max = Math.max(...maxCollector);
        } else {
            min = 0; // default values
            max = 20000;
        }
        const brand = brandCollector.join(',');
        const os = osCollector.join(',');
        const ram = ramCollector.join(',');
        const processor = processorCollector.join(',');
        const storage = storageCollector.join(',');

        db.get_all_products(brand, os, ram, processor, storage, min, max, (err, products) => {
            res.json({
                total: products.length,
                data: products.splice(offset, limit), // pagination
            });
        });
    },
    getProductById: (req, res, next) => {
        const id = parseInt(req.params.productId, 10);
        req.session.data = {};

        db.get_product(id, (err, product) => {
            req.session.data.productInfo = product;
            next();
        });
    },

    getSimilarById: (req, res) => {
        if (req.session.data.productInfo.length < 1) res.sendStatus(404);
        else {
            const price = parseInt(req.session.data.productInfo[0].price, 10);
            const id = parseInt(req.params.productId, 10);

            db.get_similar_product(price, id, (err, product) => {
                res.json({
                    product: req.session.data.productInfo,
                    similar: product.splice(0, 3),
                });
            });
        }
    },
    addToCart: (req, res) => {
        const id = parseInt(req.body.productId, 10);
        const quantity = parseInt(req.body.productQuantity, 10);

        if (!req.user) res.sendStatus(401);
        else {
            db.cart.find({ product_id: id, customer_id: req.user.id }, function (err, response) {
                if (!response || response.length === 0) {
                    db.cart.insert({ product_id: id, product_quantity: quantity, customer_id: req.user.id }, function () {
                        res.sendStatus(200);
                    });
                } else {
                    const newLength = response[0].product_quantity + quantity;
                    db.update_cart(newLength, req.user.id, id, function () {
                        res.sendStatus(200);
                    });
                }
            });
        }
    },
    getFromCart: (req, res) => {
        if (!req.user) res.sendStatus(401);
        else {
            db.cartview.find({ customer_id: req.user.id }, { order: 'date_added desc' }, function (err, response) {
                const cart = response;
                if (response.length > 0) {
                    db.get_cart_sum(req.user.id, function (error, sum) {
                        const total = sum;
                        res.json({
                            total,
                            data: cart,
                        });
                    });
                } else res.json(cart);
            });
        }
    },
    getCheckoutInfo: (req, res) => {
        if (!req.user) res.sendStatus(401);
        else {
            db.cartview.find({ customer_id: req.user.id }, { order: 'date_added desc' }, function (err, response) {
                const cart = response;
                if (response.length > 0) {
                    db.get_cart_sum(req.user.id, function (error, sum) {
                        const total = sum;
                        db.customers.find({ id: req.user.id }, function (errr, resp) {
                            const userInfo = resp;
                            res.json({
                                total,
                                userInfo,
                                data: cart,
                            });
                        });
                    });
                } else res.json(cart);
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
            db.cart.find({ customer_id: req.user.id }, function (err, cartRes) {
                // check if cart is empty
                if (!cartRes.length) res.sendStatus(204);
                else {
                    db.sum_orderline(req.user.id, function (error, sumCart) {
                        db.orderline.insert({ customer_id: req.user.id, order_total: sumCart[0].sum }, function (errr, orderlineRes) {
                            for (let idx = 0; idx < cartRes.length; idx += 1) {
                                db.orders.insert({ orderline_id: orderlineRes.id, product_id: cartRes[idx].product_id, quantity: cartRes[idx].product_quantity, fullname: userName, address: userAddress, city: userCity, state: userState, zip: userZip }, function () { // eslint-disable-line
                                    db.cart.destroy({ customer_id: req.user.id });
                                });
                            }
                            res.send('success');
                        });
                    });
                }
            });
        }
    },
    getUserOrders: (req, res) => {
        if (!req.user) res.sendStatus(401);
        else {
            db.get_all_orders(req.user.id, function (err, response) {
                res.json(response);
            });
        }
    },
    removeFromCart: (req, res) => {
        if (!req.user) res.sendStatus(401);
        else {
            const uniqueId = parseInt(req.params.id, 10);
            db.cart.destroy({ customer_id: req.user.id, id: uniqueId }, function (err, response) {
                res.json(response);
            });
        }
    },
    getOrderById: (req, res) => {
        if (!req.user) res.sendStatus(401);
        else {
            const orderId = req.params.id;
            db.get_order_by_id(req.user.id, orderId, function (err, response) {
                if (response) {
                    res.json({
                        data: response,
                        one: response.slice(0, 1),
                    });
                } else res.sendStatus(404);
            });
        }
    },
    getUserInfo: (req, res) => {
        if (!req.user) res.sendStatus(401);
        else {
            db.get_user_info(req.user.id, function (err, response) {
                res.json(response);
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
                db.update_user_profile(givenName, fullname, address, city, state, zip, req.user.id, function (err, response) {
                    if (response) {
                        req.user.givenName = givenName;
                        res.sendStatus(200);
                    } else res.sendStatus(500);
                });
            }
        }
    },
};
