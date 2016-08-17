var app = require('../app.js');
var db = app.get('db');

module.exports = {
    getProducts: (req, res) => {
        const page = (parseInt(req.params.page) - 1) * 24;
        db.get_all_products(page, (err, products) => {
            res.json(products);
        })
    }
}