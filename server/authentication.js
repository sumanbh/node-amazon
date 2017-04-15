const Pool = require('pg').Pool;
const co = require('co');
const bcrypt = require('bcrypt-nodejs');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const express = require('express');
const config = require('../config/amazon.json');

const router = express.Router();
const pool = new Pool(config.postgresql);

function createToken(user) {
    return jwt.sign(user, config.jwt.secret, { expiresIn: 60 * 60 * 24 });
}

function getCart(id) {
    return new Promise((resolve) => {
        co(function* generator() {
            const query = 'SELECT SUM(product_quantity) as total FROM cartview WHERE customer_id = $1;';
            resolve((yield pool.query(query, [id])).rows[0]);
        });
    });
}
module.exports = () => {
    router.use(passport.initialize());

    // Facebook auth begins
    passport.use(new FacebookStrategy({
        clientID: config.oauth.facebook.client,
        clientSecret: config.oauth.facebook.secret,
        callbackURL: config.oauth.facebook.callback,
        profileFields: ['id', 'email', 'displayName', 'name', 'gender'] // eslint-disable-line
    },
        function (accessToken, refreshToken, profile, cb) {
            if (!profile.emails) profile.emails = [{ value: null }]; // cases where facebook does not send user email
            co(function* () {
                let query = `
                    SELECT customers.id, customers.given_name, customers.fullname, customers.address, customers.city, customers.state, customers.zip FROM customers
                    WHERE customers.facebook_id = $1 OR customers.email = $2
                    LIMIT 1;
                    `;
                const result = yield pool.query(query, [profile.id, profile.emails[0].value]);
                if (result.rowCount === 1) {
                    // user already exists
                    const tokenObj = {
                        name: result.rows[0].given_name,
                        id: result.rows[0].id,
                    };
                    const cartCount = yield getCart(result.rows[0].id);
                    // User already exists in the database
                    return cb(null, { cart: cartCount.total || 0, token: createToken(tokenObj) });
                }
                // create new user
                query = `
                    INSERT INTO customers(facebook_id, given_name, email, fullname, local) VALUES ($1, $2, $3, $4, $5) RETURNING *;
                    `;
                const user = yield pool.query(query, [profile.id, profile.name.givenName, profile.emails[0].value, profile.displayName, false]);
                const cartCount = yield getCart(user.rows[0].id);
                const tokenObj = {
                    name: user.rows[0].given_name,
                    id: user.rows[0].id,
                };
                return cb(null, { cart: cartCount.total || 0, token: createToken(tokenObj) });
            });
        } // eslint-disable-line
    ));

    router.get('/facebook-auth', passport.authenticate('facebook', { session: false, scope: ['public_profile', 'email'] }));

    router.get('/facebook-auth/callback',
        passport.authenticate('facebook', { session: false, failureRedirect: '/login' }),
        function (req, res) {
            req.session.tempToken = req.user.token;
            req.session.tempCart = req.user.cart;
            // Successful authentication, redirect.
            res.redirect('/validate');
        });

    // Google auth begins

    passport.use(new GoogleStrategy({
        clientID: config.oauth.google.client,
        clientSecret: config.oauth.google.secret,
        callbackURL: config.oauth.google.callback // eslint-disable-line
    },
        function (accessToken, refreshToken, profile, cb) {
            co(function* generator() {
                let query = `
                    SELECT customers.id, customers.given_name, customers.fullname, customers.address, customers.city, customers.state, customers.zip from customers
                    WHERE customers.google_id = $1 OR customers.email = $2
                    LIMIT 1;
                    `;
                const result = yield pool.query(query, [profile.id, profile.emails[0].value]);
                if (result.rowCount === 1) {
                    // User already exists in the database
                    const tokenObj = {
                        name: result.rows[0].given_name,
                        id: result.rows[0].id,
                    };
                    const cartCount = yield getCart(result.rows[0].id);
                    return cb(null, { cart: cartCount.total || 0, token: createToken(tokenObj) });
                }
                // insert new user
                query = `
                    INSERT INTO customers(google_id, given_name, email, fullname, local) VALUES ($1, $2, $3, $4, $5) RETURNING *;
                    `;
                const user = yield pool.query(query, [profile.id, profile.name.givenName, profile.emails[0].value, profile.displayName, false]);
                const cartCount = yield getCart(user.rows[0].id);
                const tokenObj = {
                    name: user.rows[0].given_name,
                    id: user.rows[0].id,
                };
                return cb(null, { cart: cartCount.total, token: createToken(tokenObj) });
            });
        } // eslint-disable-line
    ));

    router.get('/google-auth',
        passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));

    router.get('/google-auth/callback',
        passport.authenticate('google', { session: false, failureRedirect: '/login' }),
        function (req, res) {
            req.session.tempToken = req.user.token;
            req.session.tempCart = req.user.cart;
            // Successful authentication, redirect.
            res.redirect('/validate');
        });

    // Local auth begins
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
        session: false // eslint-disable-line
    },
        function (req, email, password, cb) {
            co(function* generator() {
                let query = `
                    SELECT customers.password FROM customers
                    WHERE customers.email = $1
                    AND customers.local = true
                    LIMIT 1;
                    `;
                const result = (yield pool.query(query, [email]));
                if (result.rowCount > 0) {
                    const hash = result.rows[0].password;
                    bcrypt.compare(password, hash, function (error, res) {
                        if (res) {
                            co(function* gen() {
                                query = `
                                    SELECT customers.id, customers.given_name, customers.fullname, customers.address, customers.city, customers.state, customers.zip FROM customers
                                    WHERE customers.email = $1
                                    AND customers.local = true
                                    LIMIT 1;
                                    `;
                                const user = (yield pool.query(query, [email])).rows[0];
                                const cartCount = yield getCart(user.id);
                                const tokenObj = {
                                    name: user.given_name,
                                    id: user.id,
                                };
                                return cb(null, { cart: cartCount.total, token: createToken(tokenObj) });
                            });
                        } else return cb(null, false, { message: 'Incorrect password.' });
                    });
                } else return cb(null, false, { message: 'Incorrect email.' });
            });
        } // eslint-disable-line
    ));

    router.post('/login', (req, res, next) => {
        passport.authenticate('local', { session: false }, function (err, user) {
            if (err) { return next(err); }
            if (!user) { return res.json(false); }
            const success = {
                cart: user.cart || 0,
                token: user.token,
                success: true,
            };
            return res.status(200).json(success);
        })(req, res, next);
    });

    router.get('/user/status/', (req, res) => {
        if (req.session.tempToken) {
            const success = {
                cart: req.session.tempCart,
                token: req.session.tempToken,
                success: true,
            };
            delete req.session.tempToken;
            delete req.session.tempCart;
            return res.status(200).json(success);
        }
        return res.status(401).json({
            success: false,
        });
    });

    router.get('/logout', (req, res) => {
        req.session.destroy(() => {
            res.sendStatus(200);
        });
    });

    return router;
};
