const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const massive = require('massive');
const cors = require('cors');
const session = require('express-session');
const compress = require('compression');
const config = require('../config/amazon.json');
const bcrypt = require('bcrypt-nodejs');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require('passport-local').Strategy;

// Postgres path for massivejs connection
const connection = config.postgresPath;

const app = module.exports = express(); // eslint-disable-line

const massiveInstance = massive.connectSync({
    connectionString: connection,
    scripts: './server/db',  // location of db folder for massivejs
});

app.set('db', massiveInstance);
const routes = require('./routes.js');

const db = app.get('db');

app.use(session({
    secret: config.sessionSecret,
    saveUninitialized: false,
    resave: true,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(compress());
app.use(express.static(`${__dirname}/../dist`)); // location of index.html

// Facebook auth begins
passport.use(new FacebookStrategy({
    clientID: config.fbClientId,
    clientSecret: config.fbSecret,
    callbackURL: config.fbCallback,
    profileFields: ['id', 'email', 'displayName', 'name', 'gender'] // eslint-disable-line
},
    function (accessToken, refreshToken, profile, cb) {
        // console.log('profile: ', profile);
        if (!profile.emails) profile.emails = [{ value: null }]; // cases where facebook does not send user email
        db.auth_facebook([profile.id, profile.emails[0].value], function (err, foundUser) {
            if (foundUser.length < 1 || foundUser === undefined) {
                // console.log("DID NOT FIND USER. Creating...", err);
                db.customers.insert({ facebook_id: profile.id, given_name: profile.name.givenName, email: profile.emails[0].value, fullname: profile.displayName, local: false }, function (error, newUser) { // eslint-disable-line
                    // console.log('New User: ', newUser);
                    return cb(null, newUser);
                });
            } else {
                foundUser = foundUser[0];
                // console.log("FOUND USER: ", foundUser);
                return cb(null, foundUser);
            }
        });
    } // eslint-disable-line
));

app.get('/facebook-auth', passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));

app.get('/facebook-auth/callback',
    passport.authenticate('facebook', { failureRedirect: '/' }),
    function (req, res) {
        console.log('Successful Login');
        // Successful authentication, redirect home.
        res.redirect('/');
    });


// Google auth begins

passport.use(new GoogleStrategy({
    clientID: config.googClientId,
    clientSecret: config.googSecret,
    callbackURL: config.googCallback // eslint-disable-line
},
    function (accessToken, refreshToken, profile, cb) {
        db.auth_google([profile.id, profile.emails[0].value], function (err, foundUser) {
            if (foundUser.length < 1 || foundUser === undefined) {
                // console.log("DID NOT FIND USER. Creating...", err);
                db.customers.insert({ google_id: profile.id, given_name: profile.name.givenName, email: profile.emails[0].value, fullname: profile.displayName, local: false }, function (err, newUser) { // eslint-disable-line
                    return cb(null, newUser);
                });
            } else {
                foundUser = foundUser[0];
                // console.log("FOUND USER: ", foundUser);
                return cb(null, foundUser);
            }
        });
    } // eslint-disable-line
));

app.get('/google-auth',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/google-auth/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    function (req, res) {
        // Successful authentication, redirect to last user page.
        res.redirect('/');
    });

// Local auth begins
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
    session: false // eslint-disable-line
},
    function (req, email, password, cb) {
        db.auth_local_check(email, function (err, response) {
            if (response.length < 1 || response === undefined) return cb(null, false, { message: 'Incorrect email.' });
            const hash = response[0].password;
            bcrypt.compare(password, hash, function (error, res) {
                if (res) {
                    db.auth_local(email, function (errr, foundUser) {
                        foundUser = foundUser[0];
                        return cb(null, foundUser);
                    });
                } else return cb(null, false, { message: 'Incorrect password.' });
            });
        });
    } // eslint-disable-line
));

app.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user) {
        if (err) { return next(err); }
        if (!user) { return res.json(false); }
        req.logIn(user, function (error) {
            if (error) { return next(err); }
            return res.json(true);
        });
    })(req, res, next);
});

// app.get('/login', authCtrl.localAuth);

app.get('/user/status/', (req, res) => {
    // console.log('req.user: ', req.user);
    if (!req.isAuthenticated()) {
        return res.status(200).json({
            status: false,
        });
    }
    return res.status(200).json({
        userName: req.user.givenName,
        status: true,
    });
});

// Api calls

app.get('/api/product/:productId', routes.getProductById, routes.getSimilarById);
app.get('/api/shop/:page', routes.getAllProducts);
app.get('/api/user/cart', routes.getFromCart);
app.get('/api/user/checkout', routes.getCheckoutInfo);
app.get('/api/user/orders', routes.getUserOrders);
app.get('/api/user/order/:id', routes.getOrderById);
app.get('/api/user/settings', routes.getUserInfo);
app.delete('/api/user/cart/remove/:id', routes.removeFromCart);
app.post('/api/user/checkout/confirm', routes.checkoutConfirm);
app.post('/api/cart/add', routes.addToCart);
app.post('/api/user/update', routes.updateProfile);

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        req.logout();
        res.redirect('/');
    });
});

// Catch all routes
app.get('*', function (request, response) {
    response.sendFile(path.resolve('./dist/index.html'));
});

passport.serializeUser(function (user, cb) {
    const newUser = { id: user.id, givenName: user.given_name };
    cb(null, newUser);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

if (app.get('env') === 'development') {
    app.listen(3000, () => {
        console.log('App listening on port 3000!');
    });
} else {
    app.listen(8080, () => {
        console.log('App listening on port 8080!');
    });
}
