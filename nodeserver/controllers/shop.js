var app = require('../app.js');
var db = app.get('db');

module.exports = {
    getProducts: (req, res) => {
        const offset = (parseInt(req.params.page) - 1) * 24;
        const limit = 24;
        var brand = req.query['brand'];
        console.log(brand);

        if (brand === '') brand = null;
        db.get_all_products([brand], (err, products) => {
            res.json({
                total: products.length, 
                data: products.splice(offset, limit)
            });
        })
        
    }
}

