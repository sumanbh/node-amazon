import 'zone.js/dist/zone-node';

import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { join } from 'path';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync } from 'fs';
import * as routeCache from 'route-cache';
import * as jwtExpress from 'express-jwt';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as compress from 'compression';
import * as session from 'express-session';
import * as cors from 'cors';

import { AppServerModule } from './src/main.server';

// The Express app is exported so that it can be used by serverless Functions.
export function app() {
  // Config
  const CONFIG_FOLDER = join(process.cwd(), 'config');
  const config = require(join(CONFIG_FOLDER, 'amazon.json'));

  const server = express().disable('x-powered-by').use(cookieParser());
  const distFolder = join(process.cwd(), 'dist/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';

  const SERVER_FOLDER = join(process.cwd(), 'server');
  const routes = require(join(SERVER_FOLDER, 'routes.js'));
  const insertions = require(join(SERVER_FOLDER, 'new-insert'));
  const authentication = require(join(SERVER_FOLDER, 'authentication.js'));

  // Basic express session
  server.use(
    session({
      secret: config.session.secret,
      saveUninitialized: false,
      resave: true
    })
  );

  // For jwt token errors
  server.use((err, _, res, next) => {
    if (err.name === 'StatusError') {
      res.send(err.status, err.message);
    } else {
      next(err);
    }
  });

  const jwtCheck = jwtExpress({
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

  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
  }));

  server.set('view engine', 'html');
  server.set('views', distFolder);

  server.use(bodyParser.json({ limit: '5mb' }));
  server.use(bodyParser.urlencoded({ extended: false }));
  server.use(cors());
  server.use(compress());

  // Check jwt token for these routes
  server.use('/api/user', jwtCheck);

  // Authentication routes for local, google and facebook
  server.use('/auth', authentication());

  /* - Express Rest API endpoints - */
  server.get('/api/customer', routes.getCustomer);
  server.get('/api/shop/:page', routeCache.cacheSeconds(20), routes.getAllProducts); // Cache 20 seconds
  server.get(
    '/api/product/:productId',
    routeCache.cacheSeconds(86400),
    routes.getProductById
  ); // Cache 24 hours
  server.get('/api/user/cart', routes.getFromCart);
  server.get('/api/user/cart/count', routes.getCartCount);
  server.get('/api/user/checkout', routes.getCheckoutInfo);
  server.get('/api/user/orders', routes.getUserOrders);
  server.get('/api/user/order/:id', routes.getOrderById);
  server.get('/api/user/settings', routes.getUserInfo);
  server.delete('/api/user/cart/remove/:id', routes.removeFromCart);
  server.post('/api/user/checkout/confirm', routes.checkoutConfirm);
  server.post('/api/user/cart/add', routes.addToCart);
  server.post('/api/user/update', routes.updateProfile);
  server.post('/api/user/laptop', insertions.newLaptop);

  // Serve static files from /browser
  server.get('*.*', express.static(distFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Universal engine
  server.get('*', (req, res) => {
    res.render(indexHtml, { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] });
  });

  return server;
}

function run() {
  const port = process.env.PORT || 3000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Webpack will replace 'require' with '__webpack_require__'
// '__non_webpack_require__' is a proxy to Node 'require'
// The below code is to ensure that the server is run only when not requiring the bundle.
declare const __non_webpack_require__: NodeRequire;
const mainModule = __non_webpack_require__.main;
const moduleFilename = mainModule && mainModule.filename || '';
if (moduleFilename === __filename || moduleFilename.includes('iisnode')) {
  run();
}

export * from './src/main.server';
