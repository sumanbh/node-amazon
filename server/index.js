// set the mode if undefined
if (typeof process.env.NODE_ENV === 'undefined') {
  process.env.NODE_ENV = 'development';
}

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const session = require('express-session');
const compress = require('compression');
const enforce = require('express-sslify');
const routeCache = require('route-cache');
const jwtExpress = require('express-jwt');

const config = require('../config/amazon.json');
const routes = require('./routes');
const insertions = require('./new-insert');
const authentication = require('./authentication');

const app = express().disable('x-powered-by').use(cookieParser());

if (process.env.NODE_ENV !== 'development') {
  app.use(enforce.HTTPS());
}

app.use(session({
  secret: config.session.secret,
  saveUninitialized: false,
  resave: true,
}));

// For jwt token errors
app.use((err, req, res, next) => {
  if (err.name === 'StatusError') {
    res.send(err.status, err.message);
  } else {
    next(err);
  }
});

const jwtCheck = jwtExpress({
  algorithms: ['HS256'],
  secret: config.jwt.secret,
  getToken: (req) => {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    }
    if (req.cookies && req.cookies.SIO_SESSION) {
      return req.cookies.SIO_SESSION;
    }
    return null;
  },
});

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(compress());
app.use(express.static(`${__dirname}/../dist`)); // location of index.html

// check jwt token for these routes
app.use('/api/user', jwtCheck);
// Authentication routes for local, google and facebook
app.use('/auth', authentication());

// Api calls

app.get('/api/customer', routes.getCustomer);
app.get('/api/product/:productId', routeCache.cacheSeconds(86400), routes.getProductById); // Cache 24 hours
app.get('/api/shop/:page', routeCache.cacheSeconds(20), routes.getAllProducts); // Cache 20 seconds
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

// For jwt token errors
app.use((err, req, res, next) => { // eslint-disable-line
  if (err.name === 'UnauthorizedError') {
    res.status(401).send(err.inner);
  }
});

app.listen(3000, () => {
  console.log('Development API server running on port 3000!');
});
