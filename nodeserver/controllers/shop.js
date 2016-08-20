var app = require('../app.js');
var db = app.get('db');

module.exports = {
    getProducts: (req, res) => {
        const offset = (parseInt(req.params.page) - 1) * 24;
        const limit = parseInt(req.params.page) * 24;
        var brand = req.query['brand'];
        if (brand === 'undefined') brand = null;
        db.get_all_products([brand], (err, products) => {
            //get all of them, which will be response[0]
            //push response[0].length onto response
            //splice
            //respond
            // res.json(products);

            res.json({
                total: products.length, 
                data: products.splice(offset, limit)
            });
        })
        
    }
}

