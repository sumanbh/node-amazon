var app = require('../app.js');
var db = app.get('db');

module.exports = {
    getAllProducts: (req, res) => {
        const offset = (parseInt(req.params.page) - 1) * 24;
        const limit = 24;
        var brand = req.query.brand;
        var os = req.query.os;
        var ram = req.query.ram;
        var processor = req.query.processor;
        var storage = req.query.storage;

        console.log(brand);

        db.get_all_products(brand, os, ram, processor, storage, (err, products) => {
            res.json({
                total: products.length, 
                data: products.splice(offset, limit)
            });
        })
        
    },
    getProductById: (req, res) => {
        var id = parseInt(req.params.productId);

        db.get_product(id, (err, product) => {
            res.json(product);
        })
    }
}

