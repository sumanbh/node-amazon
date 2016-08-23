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

        for (var idx = 0; idx < 40000; idx ++){
            console.log(idx);
        }

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

