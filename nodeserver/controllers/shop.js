var app = require('../app.js');

var db = app.get('db');

module.exports = {
    getProducts: function(req, res){
        var page = req.params.page;
        page = (page - 1) * 24;
        console.log(page);
        db.get_all_products(page,function(err, products){
            res.json(products);
        })
    }
}