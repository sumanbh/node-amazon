const Pool = require('pg').Pool;
const bcrypt = require('bcrypt-nodejs');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const express = require('express');
const config = require('../config/amazon.json');

const router = express.Router();
const pool = new Pool(Object.assign({}, config.postgresql, { max: 5 }));

function createToken(user) {
    return jwt.sign(user, config.jwt.secret, { expiresIn: 60 * 60 * 24 });
}

function getCart(id) {
    const query = 'SELECT SUM(product_quantity) as total FROM cartview WHERE customer_id = $1;';
    return new Promise(async (resolve) => {
        resolve((await pool.query(query, [id])).rows[0]);
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
        async function (accessToken, refreshToken, profile, cb) {
            if (!profile.emails) profile.emails = [{ value: null }]; // cases where facebook does not send back user email
            let query = `
                    SELECT customers.id, customers.given_name FROM customers
                    WHERE customers.facebook_id = $1 OR customers.email = $2
                    LIMIT 1;
                    `;
            const result = await pool.query(query, [profile.id, profile.emails[0].value]);
            if (result.rowCount === 1) {
                // user already exists
                const tokenObj = {
                    name: result.rows[0].given_name,
                    id: result.rows[0].id,
                };
                const cartCount = await getCart(result.rows[0].id);
                // User already exists in the database
                return cb(null, { cart: cartCount.total || 0, token: createToken(tokenObj) });
            }
            // create new user
            query = `
                    INSERT INTO customers(facebook_id, given_name, email, fullname, local) VALUES ($1, $2, $3, $4, $5) RETURNING *;
                    `;
            const user = await pool.query(query, [profile.id, profile.name.givenName, profile.emails[0].value, profile.displayName, false]);
            const cartCount = await getCart(user.rows[0].id);
            const tokenObj = {
                name: user.rows[0].given_name,
                id: user.rows[0].id,
            };
            return cb(null, { cart: cartCount.total || 0, token: createToken(tokenObj) });
        } // eslint-disable-line
    ));

    router.get('/facebook', passport.authenticate('facebook', { session: false, scope: ['public_profile', 'email'] }));

    router.get('/facebook/callback',
        passport.authenticate('facebook', { session: false, failureRedirect: '/login' }),
        function (req, res) {
            // Successful authentication, redirect.
            res.redirect(`/validate?cart=${req.user.cart}&token=${req.user.token}`);
        });

    // Google auth begins

    passport.use(new GoogleStrategy({
        clientID: config.oauth.google.client,
        clientSecret: config.oauth.google.secret,
        callbackURL: config.oauth.google.callback // eslint-disable-line
    },
        async function (accessToken, refreshToken, profile, cb) {
            let query = `
                    SELECT customers.id, customers.given_name from customers
                    WHERE customers.google_id = $1 OR customers.email = $2
                    LIMIT 1;
                    `;
            const result = await pool.query(query, [profile.id, profile.emails[0].value]);
            if (result.rowCount === 1) {
                // User already exists in the database
                const tokenObj = {
                    name: result.rows[0].given_name,
                    id: result.rows[0].id,
                };
                const cartCount = await getCart(result.rows[0].id);
                return cb(null, { cart: cartCount.total || 0, token: createToken(tokenObj) });
            }
            // insert new user
            query = `
                    INSERT INTO customers(google_id, given_name, email, fullname, local) VALUES ($1, $2, $3, $4, $5) RETURNING *;
                    `;
            const user = await pool.query(query, [profile.id, profile.name.givenName, profile.emails[0].value, profile.displayName, false]);
            const cartCount = await getCart(user.rows[0].id);
            const tokenObj = {
                name: user.rows[0].given_name,
                id: user.rows[0].id,
            };
            return cb(null, { cart: cartCount.total || 0, token: createToken(tokenObj) });
        } // eslint-disable-line
    ));

    router.get('/google',
        passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));

    router.get('/google/callback',
        passport.authenticate('google', { session: false, failureRedirect: '/login' }),
        function (req, res) {
            // Successful authentication, redirect.
            res.redirect(`/validate?cart=${req.user.cart}&token=${req.user.token}`);
        });

    // Local auth begins
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
        session: false // eslint-disable-line
    },
        async function (req, email, password, cb) {
            let query = `
                SELECT customers.password FROM customers
                WHERE customers.email = $1
                AND customers.local = true
                LIMIT 1;
                `;
            const result = await pool.query(query, [email]);
            if (result.rowCount === 0) return cb(null, false, 'The email you entered is incorrect.');
            const hash = result.rows[0].password;
            bcrypt.compare(password, hash, async function (error, res) {
                if (res) {
                    query = `
                        SELECT customers.id, customers.given_name FROM customers
                        WHERE customers.email = $1
                        AND customers.local = true
                        LIMIT 1;
                        `;
                    const user = (await pool.query(query, [email])).rows[0];
                    const cartCount = await getCart(user.id);
                    const tokenObj = {
                        name: user.given_name,
                        id: user.id,
                    };
                    return cb(null, { cart: cartCount.total || 0, token: createToken(tokenObj) });
                }
                return cb(null, false, 'The password you entered is incorrect.');
            });
        } // eslint-disable-line
    ));

    router.post('/login', (req, res, next) => {
        passport.authenticate('local', { session: false }, function (err, user, message) {
            if (err) { return next(err); }
            if (!user) {
                return res.status(200).json({ success: false, err: message });
            }
            const success = {
                cart: user.cart || 0,
                token: user.token,
                success: true,
            };
            return res.status(200).json(success);
        })(req, res, next);
    });

    router.get('/logout', (req, res) => {
        req.session.destroy(() => {
            res.sendStatus(200);
        });
    });

    return router;
};
