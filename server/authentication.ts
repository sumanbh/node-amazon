import bcrypt from 'bcryptjs';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as LocalStrategy } from 'passport-local';
import jwt from 'jsonwebtoken';
import express, { Request, Response, Router } from 'express';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { db } from './connection';

const configPath = path.resolve(process.cwd(), 'config/amazon.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const router = express.Router();

interface PassportProfile {
  id: string;
  emails?: { value: string | null }[];
  name?: { givenName?: string };
  displayName?: string;
}

interface AuthUser {
  name?: string | null;
  cart?: number;
  token?: string;
}

interface CustomAuthRequest extends Request {
  user?: AuthUser;
  auth?: AuthUser;
}

function createToken(user: { id: string }): string {
  return jwt.sign(user, config.jwt.secret, { expiresIn: 60 * 60 * 24 });
}

async function getCart(id: string) {
  const result = await db.selectFrom('cartview')
    .select(db.fn.sum<string | number>('product_quantity').as('total'))
    .where('customer_id', '=', id)
    .executeTakeFirst();
  return { total: result?.total ? Number(result.total) : 0 };
}

export default function initAuth(): Router {
  router.use(passport.initialize());

  // Facebook Strategy
  passport.use(
    new FacebookStrategy(
      {
        clientID: config.oauth.facebook.client,
        clientSecret: config.oauth.facebook.secret,
        callbackURL: config.oauth.facebook.callback,
        profileFields: ['id', 'email', 'displayName', 'name', 'gender'],
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: PassportProfile,
        cb: (err: unknown, user?: unknown) => void
      ) => {
        try {
          const emails = profile.emails || [{ value: null }];
          const email = emails[0].value;

          const existingUser = await db.selectFrom('customers')
            .select(['id', 'given_name'])
            .where((eb) =>
              eb('facebook_id', '=', profile.id)
                .or(email ? eb('email', '=', email) : eb.val(false))
            )
            .limit(1)
            .executeTakeFirst();

          if (existingUser) {
            const tokenObj = { id: existingUser.id };
            return cb(null, { token: createToken(tokenObj) });
          }

          const insertedUser = await db.insertInto('customers')
            .values({
              id: undefined,
              google_id: undefined,
              facebook_id: profile.id,
              given_name: profile.name?.givenName || null,
              email: email,
              fullname: profile.displayName || null,
              password: undefined,
              phone: undefined,
              address: undefined,
              city: undefined,
              state: undefined,
              zip: undefined,
              local: false,
              date_added: undefined,
            })
            .returningAll()
            .executeTakeFirstOrThrow();

          const tokenObj = { id: insertedUser.id };
          return cb(null, { token: createToken(tokenObj) });
        } catch (err) {
          return cb(err);
        }
      }
    )
  );

  router.get('/facebook', passport.authenticate('facebook', { session: false, scope: ['public_profile', 'email'] }));

  router.get(
    '/facebook/callback',
    passport.authenticate('facebook', { session: false, failureRedirect: '/login' }),
    (req: CustomAuthRequest, res: Response) => {
      const token = req.user?.token || req.auth?.token;
      res.cookie('SIO_SESSION', token || '', { maxAge: 24 * 60 * 60 * 1000, httpOnly: true }).redirect('/');
    }
  );

  // Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.oauth.google.client,
        clientSecret: config.oauth.google.secret,
        callbackURL: config.oauth.google.callback,
      },
      async (
        _accessToken: string,
        _refreshToken: string,
        profile: PassportProfile,
        cb: (err: unknown, user?: unknown) => void
      ) => {
        try {
          const email = profile.emails?.[0]?.value || null;

          const existingUser = await db.selectFrom('customers')
            .select(['id', 'given_name'])
            .where((eb) =>
              eb('google_id', '=', profile.id)
                .or(email ? eb('email', '=', email) : eb.val(false))
            )
            .limit(1)
            .executeTakeFirst();

          if (existingUser) {
            const tokenObj = { id: existingUser.id };
            return cb(null, { token: createToken(tokenObj) });
          }

          const insertedUser = await db.insertInto('customers')
            .values({
              id: undefined,
              google_id: profile.id,
              facebook_id: undefined,
              given_name: profile.name?.givenName || null,
              email: email,
              fullname: profile.displayName || null,
              password: undefined,
              phone: undefined,
              address: undefined,
              city: undefined,
              state: undefined,
              zip: undefined,
              local: false,
              date_added: undefined,
            })
            .returningAll()
            .executeTakeFirstOrThrow();

          const tokenObj = { id: insertedUser.id };
          return cb(null, { token: createToken(tokenObj) });
        } catch (err) {
          return cb(err);
        }
      }
    )
  );

  router.get(
    '/google',
    passport.authenticate('google', { session: false, scope: ['profile', 'email'] })
  );

  router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    (req: CustomAuthRequest, res: Response) => {
      const token = req.user?.token || req.auth?.token;
      res.cookie('SIO_SESSION', token || '', { maxAge: 24 * 60 * 60 * 1000, httpOnly: true }).redirect('/');
    }
  );

  // Local Strategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
        session: false,
      },
      async (
        _req: Request,
        email: string,
        password: string,
        cb: (err: unknown, user?: unknown, info?: unknown) => void
      ) => {
        try {
          const result = await db.selectFrom('customers')
            .select(['password'])
            .where('email', '=', email)
            .where('local', '=', true)
            .limit(1)
            .executeTakeFirst();

          if (!result || !result.password) {
            return cb(null, false, 'The email you entered is incorrect.');
          }

          bcrypt.compare(password, result.password, async (error: unknown, isValid: boolean) => {
            if (error) {
              return cb(error);
            }
            if (isValid) {
              const user = await db.selectFrom('customers')
                .select(['id', 'given_name'])
                .where('email', '=', email)
                .where('local', '=', true)
                .limit(1)
                .executeTakeFirst();

              if (!user) {
                return cb(null, false, 'The email you entered is incorrect.');
              }

              const cartCount = await getCart(user.id);
              const tokenObj = { id: user.id };

              return cb(null, {
                name: user.given_name,
                cart: cartCount.total || 0,
                token: createToken(tokenObj),
              });
            }
            return cb(null, false, 'The password you entered is incorrect.');
          });
        } catch (err) {
          return cb(err);
        }
      }
    )
  );

  router.post('/login', (req, res, next) => {
    passport.authenticate('local', { session: false }, (err: unknown, user: unknown, message: unknown) => {
      if (err) {
        return next(err);
      }
      const authUser = user as AuthUser | undefined;
      if (!authUser) {
        return res.status(200).json({ success: false, err: message as string });
      }
      const response = {
        name: authUser.name,
        cart: authUser.cart || 0,
        success: true,
      };
      res.cookie('SIO_SESSION', authUser.token || '', { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
      return res.status(200).json(response);
    })(req, res, next);
  });

  router.get('/logout', (req: CustomAuthRequest, res: Response) => {
    const sessionObj = req.session;
    if (sessionObj) {
      sessionObj.destroy(() => {
        res.clearCookie('SIO_SESSION').sendStatus(200);
      });
    } else {
      res.clearCookie('SIO_SESSION').sendStatus(200);
    }
  });

  return router;
}
