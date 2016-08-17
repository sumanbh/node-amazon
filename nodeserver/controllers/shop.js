var app = require('../app.js');

var db = app.get('db');

module.exports = {
    getProducts: function(req, res){
        db.get_all_products(function(err, products){
            res.json(products);
        })
    }
}