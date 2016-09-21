const app = require('../app.js');
const db = app.get('db');

module.exports = {
    getAllProducts: (req, res) => {
        const offset = (parseInt(req.params.page) - 1) * 24;
        const limit = 24;
        const brand = req.query.brand;
        const os = req.query.os;
        const ram = req.query.ram;
        const processor = req.query.processor;
        const storage = req.query.storage;
        const min = parseInt(req.query.min) || 0; //default price values
        const max = parseInt(req.query.max) || 20000;

        db.get_all_products(brand, os, ram, processor, storage, min, max, (err, products) => {
            res.json({
                total: products.length,
                data: products.splice(offset, limit) //for pagination 
            });
        })
    },
    getProductById: (req, res, next) => {
        const id = parseInt(req.params.productId);
        req.session.data = {};

        db.get_product(id, (err, product) => {
            req.session.data.productInfo = product;
            next();
        })
    },

    getSimilarById: (req, res, next) => {
        if (req.session.data.productInfo.length < 1) res.sendStatus(404);
        else {
            const price = parseInt(req.session.data.productInfo[0].price);
            const id = parseInt(req.params.productId);

            db.get_similar_product(price, id, (err, product) => {
                res.json({
                    product: req.session.data.productInfo,
                    similar: product.splice(0, 3)
                });
            })
        }
    },
    addToCart: (req, res, next) => {
        const id = parseInt(req.body.productId);
        const quantity = parseInt(req.body.productQuantity);

        if (!req.user) res.sendStatus(401);
        else {
            db.cart.find({ product_id: id, customer_id: req.user.id }, function (err, response) {
                if (!response || response.length === 0) {
                    console.log('i am here: ', req.user.id);
                    db.cart.insert({ product_id: id, product_quantity: quantity, customer_id: req.user.id }, function (err, response) {
                        res.sendStatus(200);
                    })
                }
                else {
                    const newLength = response[0].product_quantity + quantity;
                    db.update_cart(newLength, req.user.id, id, function (err, response) {
                        res.sendStatus(200);
                    })
                }
            })
        }

    },
    getFromCart: (req, res, next) => {
        if (!req.user) res.sendStatus(401);
        else {
            db.cartview.find({ customer_id: req.user.id }, { order: "date_added desc" }, function (err, response) {
                res.json(response);
            })
        }
    },
    getCheckoutInfo: (req, res, next) => {
        if (!req.user) res.sendStatus(401);
        else {
            db.cartview.find({ customer_id: req.user.id }, { order: "date_added desc" }, function (err, response) {
                req.session.cart = response;
                db.customers.find({ id: req.user.id }, function (err, response) {
                    req.session.userInfo = response;
                    res.json({
                        data: req.session.cart,
                        userInfo: req.session.userInfo
                    })
                })
            })
        }
    },
    checkoutConfirm: (req, res, next) => {
        const userName = req.body.fullname;
        const userAddress = req.body.address;
        const userCity = req.body.city;
        const userState = req.body.state;
        const userZip = req.body.zip;

        if (!req.user) res.sendStatus(401);
        else {
            db.cart.find({ customer_id: req.user.id }, function (err, cartRes) {
                //check if cart is empty
                if (!cartRes.length) res.sendStatus(204);
                else {
                    db.sum_orderline(req.user.id, function (err, sumCart) {
                        db.orderline.insert({ customer_id: req.user.id, order_total: sumCart[0].sum }, function (err, orderlineRes) {
                            for (var idx = 0; idx < cartRes.length; idx++) {
                                db.orders.insert({ orderline_id: orderlineRes.id, product_id: cartRes[idx].product_id, quantity: cartRes[idx].product_quantity, fullname: userName, address: userAddress, city: userCity, state: userState, zip: userZip }, function (err, response) {
                                    db.cart.destroy({ customer_id: req.user.id })
                                })
                            }
                            res.send('success');
                        })

                    })
                }

            })
        }
    },
    getUserOrders: (req, res, next) => {
        if (!req.user) res.sendStatus(401);
        else {
            db.get_all_orders(req.user.id, function (err, response) {
                res.json(response);
            })
        }
    },
    removeFromCart: (req, res, next) => {
        if (!req.user) res.sendStatus(401);
        else {
            const uniqueId = parseInt(req.params.id);
            db.cart.destroy({ customer_id: req.user.id, id: uniqueId }, function (err, response) {
                res.json(response);
            })
        }
    },
    getOrderById: (req, res, next) => {
        if (!req.user) res.sendStatus(401);
        else {
            const orderId = req.params.id;
            db.get_order_by_id(req.user.id, orderId, function(err, response) {
                if (response){
                    res.json({
                    data: response,
                    one: response.slice(0, 1)
                })
                }
                else res.sendStatus(404);
            })
        }
    },
    getUserInfo: (req, res, next) => {
        if (!req.user) res.sendStatus(401);
        else {
            db.get_user_info(req.user.id, function(err, response){
                res.json(response);
            })
        }
    },
    updateProfile: (req, res, next) => {
        if (!req.user) res.sendStatus(401);
        else {
            const given_name = req.body.given_name;
            const fullname = req.body.fullname;
            const address = req.body.address;
            const city = req.body.city;
            const state = req.body.state;
            const zip = req.body.zip;
            if (given_name && fullname && address && city && state && zip) {
                db.update_user_profile(given_name, fullname, address, city, state, zip, req.user.id, function (err, response){
                    if (response) {
                        req.user.given_name = given_name;
                        res.sendStatus(200)
                    }
                    else res.sendStatus(500)
                })
            }
        }
    }
}