import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr/node';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import AppServerModule from './src/main.server';

import { createRequire } from 'node:module';
import { REQUEST } from './src/app/express.tokens';

const require = createRequire(import.meta.url);

const routeCache = require('route-cache');
const { expressjwt } = require('express-jwt');
const cookieParser = require('cookie-parser');
const compress = require('compression');
const session = require('express-session');
const cors = require('cors');

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  // Config
  const CONFIG_FOLDER = join(process.cwd(), 'config');
  const config = require(join(CONFIG_FOLDER, 'amazon.json'));

  const SERVER_FOLDER = join(process.cwd(), 'server');
  const routes = require(join(SERVER_FOLDER, 'routes.js'));
  const insertions = require(join(SERVER_FOLDER, 'new-insert'));
  const authentication = require(join(SERVER_FOLDER, 'authentication.js'));

  const server = express().disable('x-powered-by').use(cookieParser());

  // Rewrite /demo paths to base paths to avoid routing issues and SSR deadlocks
  server.use((req, res, next) => {
    if (req.url.startsWith('/demo/')) {
      req.url = req.url.replace(/^\/demo/, '');
    } else if (req.url === '/demo') {
      req.url = '/';
    }
    next();
  });

  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine({ allowedHosts: ['localhost', '127.0.0.1'] });

  // Basic express session
  server.use(
    session({
      secret: config.session.secret,
      saveUninitialized: false,
      resave: true
    })
  );

  // For jwt token errors
  server.use((
    err: Error & { name?: string; status?: number },
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (err.name === 'StatusError') {
      res.status(err.status || 500).send(err.message);
    } else {
      next(err);
    }
  });

  const jwtCheck = expressjwt({
    algorithms: ['HS256'],
    secret: config.jwt.secret,
    getToken: (req: express.Request) => {
      if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
      }
      if (req.cookies && req.cookies.SIO_SESSION) {
        return req.cookies.SIO_SESSION;
      }
      return null;
    },
  });

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  server.use(express.json({ limit: '5mb' }));
  server.use(express.urlencoded({ extended: false }));
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
  server.get('**', express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html',
  }));

  // All regular routes use the Angular engine
  server.get('**', (req, res, next) => {
    console.log(`[Express] [${new Date().toISOString()}] Starting SSR render for ${req.url}`);
    const { protocol, originalUrl, headers } = req;

    commonEngine
      .render({
        bootstrap: AppServerModule,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [
          { provide: APP_BASE_HREF, useValue: '/demo/' },
          { provide: REQUEST, useValue: req }
        ],
      })
      .then((html) => {
        console.log(`[Express] [${new Date().toISOString()}] Finished SSR render for ${req.url}`);
        res.send(html);
      })
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 3000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();

export * from './src/main.server';
