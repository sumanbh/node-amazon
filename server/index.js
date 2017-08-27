// set the mode if undefined
if (typeof process.env.NODE_ENV === 'undefined') {
    process.env.NODE_ENV = 'development';
}

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const compress = require('compression');
const config = require('../config/amazon.json');
const jwtExpress = require('express-jwt');
const routes = require('./routes.js');
const insertions = require('./new-insert');
const authentication = require('./authentication.js');
const enforce = require('express-sslify');

const app = express();

if (process.env.NODE_ENV !== 'development') {
    app.use(enforce.HTTPS());
}

app.use(session({
    secret: config.session.secret,
    saveUninitialized: false,
    resave: true,
}));

app.use((err, req, res, next) => {
    if (err.name === 'StatusError') {
        res.send(err.status, err.message);
    } else {
        next(err);
    }
});

const jwtCheck = jwtExpress({
    secret: config.jwt.secret,
});

app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(compress());
app.use(express.static(`${__dirname}/../dist`)); // location of index.html
// check jwt token for these routes
app.use('/api/user', jwtCheck);
// Authentication routes for local, google and facebook
app.use('/auth', authentication());

// Api calls

app.get('/api/product/:productId', routes.getProductById);
app.get('/api/shop/:page', routes.getAllProducts);
app.get('/api/user/cart', routes.getFromCart);
app.get('/api/user/cart/count', routes.getCartCount);
app.get('/api/user/checkout', routes.getCheckoutInfo);
app.get('/api/user/orders', routes.getUserOrders);
app.get('/api/user/order/:id', routes.getOrderById);
app.get('/api/user/settings', routes.getUserInfo);
app.delete('/api/user/cart/remove/:id', routes.removeFromCart);
app.post('/api/user/checkout/confirm', routes.checkoutConfirm);
app.post('/api/user/cart/add', routes.addToCart);
app.post('/api/user/update', routes.updateProfile);
app.post('/api/user/laptop', insertions.newLaptop);

// Catch all routes
app.get('*', (req, res) => {
    res.sendFile(path.resolve('./dist/index.html'));
});

app.use((err, req, res, next) => { // eslint-disable-line
    if (err.name === 'UnauthorizedError') {
        res.status(401).send(err.inner);
    }
});

app.listen(3000, () => {
    console.log('App listening on port 3000!');
});
