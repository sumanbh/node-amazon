var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var massive = require('massive');
var cors = require('cors');
var session = require('express-session');

var config = require('./config.json');

var connection = "postgres://suman@localhost/amazonia";

var app = module.exports = express();

var massiveInstance = massive.connectSync({
  connectionString: connection,
  scripts: "./nodeserver/db"   //location of db folder for massive
});

app.set('db', massiveInstance);

var shopCtrl = require('./controllers/shop.js');

app.use(session({
    secret: config.secret,
    saveUninitialized: false,
    resave: true
}));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static(__dirname + '/../dist')); //location of index.html for node to serve

app.get('/api/product/:productId', shopCtrl.getProductById, shopCtrl.getSimilarById);

app.get('/api/shop/:page', shopCtrl.getAllProducts);


// catch 404 and forward to error handler
app.use((req, res, next) => {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.listen(3000, () => {
        console.log('App listening on port 3000!');
    });
}
else {
    app.listen(8080, () => {
        console.log('App listening on port 8080!');
    });
}