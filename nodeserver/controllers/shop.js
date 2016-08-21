var app = require('../app.js');
var db = app.get('db');

module.exports = {
    getProducts: (req, res) => {
        const offset = (parseInt(req.params.page) - 1) * 24;
        const limit = 24;
        var brand = req.query.brand;
        var os = req.query.os;
        var ram = req.query.ram;
        var processor = req.query.processor;
        var storage = req.query.storage;

        db.get_all_products(brand, os, ram, processor, storage, (err, products) => {
            console.log(err);
            res.json({
                total: products.length, 
                data: products.splice(offset, limit)
            });
        })
        
    }
}

