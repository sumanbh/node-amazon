var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var massive = require('massive');
var cors = require('cors');

var connection = "postgres://suman@localhost/amazonia";


var app = module.exports = express();

var massiveInstance = massive.connectSync({
  connectionString: connection,
  scripts: "./nodeserver/db"
});

app.set('db', massiveInstance);

var shopCtrl = require('./controllers/shop.js');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(__dirname + '/../dist'));

// app.get('/*', function (req, res) {
//     res.sendFile(path.join(__dirname + '/../dist', 'index.html'));
// });


app.get('/api/products', shopCtrl.getProducts);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.listen(3000, function () {
        console.log('App listening on port 3000!');
    });
}
else {
    app.listen(8080, function () {
        console.log('App listening on port 8080!');
    });
}