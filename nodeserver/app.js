const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const massive = require('massive');
const cors = require('cors');
const session = require('express-session');

const bcrypt = require('bcrypt-nodejs');
const google = require('googleapis');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require('passport-local').Strategy;

const config = require('./config.json');

// Postgres path for massivejs connection
const connection = config.postgresPath;

const app = module.exports = express();

const massiveInstance = massive.connectSync({
    connectionString: connection,
    scripts: "./nodeserver/db"   //location of db folder for massive
});

app.set('db', massiveInstance);

const db = app.get('db');

const shopCtrl = require('./controllers/shop.js');

app.use(session({
    secret: config.sessionSecret,
    saveUninitialized: false,
    resave: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static(__dirname + '/../dist')); //location of index.html for node to serve

// Facebook auth begins
passport.use(new FacebookStrategy({
    clientID: config.fbClientId,
    clientSecret: config.fbSecret,
    callbackURL: config.fbCallback,
    profileFields: ['id','email', 'displayName', 'name', 'gender']
},
    function (accessToken, refreshToken, profile, cb) {
        // console.log('profile: ', profile);
        if (!profile.emails) profile.emails = [{value: null}];     //rare? cases where facebook does not send user email
        db.auth_facebook([profile.id, profile.emails[0].value], function (err, foundUser) {
            if (foundUser.length < 1 || foundUser === undefined) {
                // console.log("DID NOT FIND USER. Creating...", err);
                db.customers.insert({ facebook_id: profile.id, given_name: profile.name.givenName, email: profile.emails[0].value, fullname: profile.displayName, local: false }, function (err, newUser) {
                    // console.log('New User: ', newUser);
                    return cb(null, newUser);
                })
            }
            else {
                foundUser = foundUser[0];
                // console.log("FOUND USER: ", foundUser);
                return cb(null, foundUser);
            }
        });
    }
));

app.get('/facebook-auth', passport.authenticate('facebook', { scope: ['public_profile', 'email']}));

app.get('/facebook-auth/callback',
    passport.authenticate('facebook', { failureRedirect: '/' }),
    function (req, res) {
        console.log('Successful Login')
        // Successful authentication, redirect home.
        res.redirect('/');
    });


// Google auth begins

passport.use(new GoogleStrategy({
    clientID: config.googClientId,
    clientSecret: config.googSecret,
    callbackURL: config.googCallback
},
    function (accessToken, refreshToken, profile, cb) {
        db.auth_google([profile.id, profile.emails[0].value], function (err, foundUser) {
            if (foundUser.length < 1 || foundUser === undefined) {
                // console.log("DID NOT FIND USER. Creating...", err);
                db.customers.insert({ google_id: profile.id, given_name: profile.name.givenName, email: profile.emails[0].value, fullname: profile.displayName, local: false }, function (err, newUser) {
                    return cb(null, newUser);
                })
            }
            else {
                foundUser = foundUser[0];
                // console.log("FOUND USER: ", foundUser);
                return cb(null, foundUser);
            }
        });
    }
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
    session: false
  },
  function(req, email, password, cb) {
      db.auth_local_check(email, function(err, response){
          if (response.length <1 || response === undefined) return cb(null, false, { message: 'Incorrect email.' })
          let hash = response[0].password;
        //   bcrypt.genSalt(10, function (err, salt) {
        //     bcrypt.hash('', null, null, function (err, hash) {
        //         console.log('hash generated: ', hash);
        // // var hash = '$2a$10$P0DyhANivkUaeNqjGx8LNuQQKbUEIhwx4yFf/twfl/L6YXNRFF4b.';
        //         bcrypt.compare('', hash, function (err, res) {
        //             console.log('is hash the same? :', res);
        //         });
        //     });
        // });
          bcrypt.compare(password, hash, function (err, res) {
              if (res) {
                  db.auth_local(email, function (err, foundUser){
                      foundUser = foundUser[0];
                      return cb(null, foundUser);
                  })
              }
              else return cb(null, false, { message: 'Incorrect password.' })
            });
      })
  }
));

app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.json(false); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.json(true);
    });
  })(req, res, next);
});

// app.get('/login', authCtrl.localAuth);

app.get('/user/status/', (req, res) => {
    // console.log('req.user: ', req.user);
    if (!req.isAuthenticated()) {
        return res.status(200).json({
            status: false
        });
    }
    else {res.status(200).json({
        userName: req.user.given_name,
        status: true,
    });
    }
})

//Api calls begin 

app.get('/api/product/:productId', shopCtrl.getProductById, shopCtrl.getSimilarById);
app.get('/api/shop/:page', shopCtrl.getAllProducts);
app.get('/api/user/cart', shopCtrl.getFromCart);
app.get('/api/user/checkout', shopCtrl.getCheckoutInfo);
app.get('/api/user/orders', shopCtrl.getUserOrders);
app.get('/api/user/order/:id', shopCtrl.getOrderById);
app.delete('/api/user/cart/remove/:id', shopCtrl.removeFromCart);
app.post('/api/user/checkout/confirm', shopCtrl.checkoutConfirm);
app.post('/api/cart/add', shopCtrl.addToCart);

app.get('/logout', (req, res) => {
    req.session.destroy((e) => {
        req.logout();
        res.redirect('/');
    })
});

// Wildcard for all possible routes
app.get('*', function (request, response) {
    response.sendFile(path.resolve('./dist/index.html'))
});

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
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