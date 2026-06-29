import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { sql } from 'kysely';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { db } from './connection';

const configPath = path.resolve(process.cwd(), 'config/amazon.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

export interface AuthenticatedRequest extends Request {
  auth?: {
    id: string;
    [key: string]: unknown;
  };
}

export interface CheckoutRequest extends AuthenticatedRequest {
  body: {
    fullname?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const auth = (req as AuthenticatedRequest).auth;
  if (!auth || !auth.id) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

export function getCustomerId(req: AuthenticatedRequest): string {
  const auth = req.auth;
  if (!auth) {
    throw new Error('Unauthorized');
  }
  return auth.id;
}

export async function getCartCountHelper(customerId: string): Promise<{ total: number }> {
  const result = await db.selectFrom('cartview')
    .select(db.fn.sum<string | number>('product_quantity').as('total'))
    .where('customer_id', '=', customerId)
    .executeTakeFirst();
  return { total: result?.total ? Number(result.total) : 0 };
}

export async function getCartCount(req: AuthenticatedRequest, res?: Response): Promise<unknown> {
  try {
    const customerId = getCustomerId(req);
    const result = await getCartCountHelper(customerId);
    return res?.status(200).json(result);
  } catch {
    return res?.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function getCustomer(req: Request, res: Response): Promise<void> {
  if (!req.cookies || !req.cookies.SIO_SESSION) {
    res.status(200).json({ name: null, cart: null });
    return;
  }
  const token = req.cookies.SIO_SESSION;

  try {
    const { id } = jwt.verify(token, config.jwt.secret) as { id: string };
    const [customer, cartCount] = await Promise.all([
      db.selectFrom('customers')
        .select(['id', 'given_name'])
        .where('id', '=', id)
        .executeTakeFirst(),
      getCartCountHelper(id),
    ]);

    if (!customer) {
      throw new Error('customer not found');
    }

    res.status(200).json({ name: customer.given_name, cart: cartCount.total || 0 });
  } catch {
    res.clearCookie('SIO_SESSION');
    res.status(401).json({ name: null, cart: null, error: 'Invalid or expired session' });
  }
}

export async function getAllProducts(req: Request, res: Response): Promise<void> {
  const pageNum = parseInt(req.params.page, 10);
  if (isNaN(pageNum) || pageNum < 1) {
    res.status(400).json({ error: 'Invalid page parameter' });
    return;
  }
  const offset = (pageNum - 1) * 24;
  const limit = 24;

  let obj: Record<string, Record<string, boolean>> = {};
  if (req.query.obj) {
    try {
      obj = JSON.parse(req.query.obj as string);
    } catch {
      res.status(400).json({ error: 'Invalid obj query parameter' });
      return;
    }
  } else {
    res.status(400).json({ error: 'Missing obj query parameter' });
    return;
  }
  const list = Object.keys(obj);
  let brands: string[] = [];
  let os: string[] = [];
  let processor: string[] = [];
  let storage: string[] = [];
  let ram: string[] = [];
  let min = 0;
  let max = 20000;
  let search = '';

  if (req.query.min) min = parseInt(req.query.min as string, 10) || 0;
  if (req.query.max) max = parseInt(req.query.max as string, 10) || 20000;

  list.forEach((value) => {
    switch (value) {
      case 'brand': {
        const keys = Object.keys(obj[value]);
        brands = keys.filter((key) => obj[value][key]);
        break;
      }
      case 'os': {
        const keys = Object.keys(obj[value]);
        os = keys.filter((key) => obj[value][key]);
        break;
      }
      case 'processor': {
        const keys = Object.keys(obj[value]);
        processor = keys.filter((key) => obj[value][key]);
        break;
      }
      case 'ram': {
        const keys = Object.keys(obj[value]);
        ram = keys.filter((key) => obj[value][key]);
        break;
      }
      case 'storage': {
        const keys = Object.keys(obj[value]);
        storage = keys.filter((key) => obj[value][key]);
        break;
      }
      case 'search': {
        const searchTerm = obj[value] as unknown as string;
        if (searchTerm) {
          search = `${searchTerm}`.toLowerCase();
        }
        break;
      }
    }
  });

  let query = db.selectFrom('laptops')
    .innerJoin('brand', 'laptops.brand_id', 'brand.id')
    .innerJoin('os', 'laptops.os_id', 'os.id')
    .innerJoin('processor', 'laptops.processor_id', 'processor.id')
    .innerJoin('storage_type', 'laptops.storage_type_id', 'storage_type.id')
    .select([
      'laptops.id',
      'laptops.img',
      'laptops.price',
      'laptops.rating',
      'laptops.name',
      sql<string | number>`count(*) over()`.as('full_count'),
    ]);

  if (brands.length > 0) {
    query = query.where((eb) =>
      eb(eb.fn('lower', ['brand.name']), 'in', brands.map((b) => b.toLowerCase()))
    );
  }

  if (os.length > 0) {
    query = query.where((eb) =>
      eb(eb.fn('lower', ['os.name']), 'in', os.map((o) => o.toLowerCase()))
    );
  }

  if (ram.length > 0) {
    query = query.where('laptops.ram', 'in', ram);
  }

  if (processor.length > 0) {
    query = query.where((eb) =>
      eb(eb.fn('lower', ['processor.name']), 'in', processor.map((p) => p.toLowerCase()))
    );
  }

  if (storage.length > 0) {
    query = query.where((eb) =>
      eb(eb.fn('lower', ['storage_type.name']), 'in', storage.map((s) => s.toLowerCase()))
    );
  }

  query = query.where('laptops.price', '>=', String(min))
               .where('laptops.price', '<', String(max));

  if (search) {
    const escapedSearch = search
      .replace(/-/g, ' ')
      .replace(/\\/g, '\\\\')
      .replace(/%/g, '\\%')
      .replace(/_/g, '\\_')
      .trim() || ' ';
    const searchPattern = `%${escapedSearch}%`;
    query = query.where((eb) =>
      eb(
        eb.fn('translate', [eb.fn('lower', ['laptops.name']), eb.val('-'), eb.val(' ')]),
        'like',
        searchPattern
      )
    );
  }

  query = query.orderBy('laptops.rating', 'desc');

  const rows = await query.limit(limit).offset(offset).execute();
  const total = rows.length > 0 ? Number(rows[0].full_count) : 0;
  const paginatedData = rows.map((row) => ({
    id: row.id,
    img: row.img,
    price: row.price,
    rating: row.rating,
    name: row.name,
  }));

  res.status(200).json({
    total,
    data: paginatedData,
  });
}

export async function getProductById(req: Request, res: Response): Promise<void> {
  const id = req.params.productId;

  const mainProductRows = await db.selectFrom('laptops')
    .innerJoin('brand', 'laptops.brand_id', 'brand.id')
    .innerJoin('os', 'laptops.os_id', 'os.id')
    .innerJoin('storage_type', 'laptops.storage_type_id', 'storage_type.id')
    .select([
      'laptops.id',
      'laptops.name as laptop_name',
      'laptops.img',
      'laptops.ram',
      'laptops.storage',
      'laptops.img_big',
      'laptops.price',
      'laptops.rating',
      'laptops.description',
      'os.name as os_name',
      'brand.name as brand_name',
      'storage_type.name as storage_name',
    ])
    .where('laptops.id', '=', id)
    .execute();

  if (mainProductRows.length === 0) {
    res.status(404).json({ success: false });
    return;
  }

  const mainProduct = mainProductRows[0];
  const price = Math.floor(Number(mainProduct.price));
  const mainId = mainProduct.id;

  const similarProducts = await db.selectFrom('laptops')
    .innerJoin('brand', 'laptops.brand_id', 'brand.id')
    .innerJoin('os', 'laptops.os_id', 'os.id')
    .innerJoin('storage_type', 'laptops.storage_type_id', 'storage_type.id')
    .select([
      'laptops.id',
      'laptops.name as laptop_name',
      'laptops.rating',
      'laptops.img',
      'laptops.price',
      'laptops.ram',
      'laptops.storage',
      'os.name as os_name',
      'brand.name as brand_name',
      'storage_type.name as storage_name',
    ])
    .where('laptops.price', '<=', String(price + 150))
    .where('laptops.price', '>=', String(price - 250))
    .where('laptops.id', '<>', mainId)
    .limit(3)
    .execute();

  res.status(200).json({
    product: mainProductRows,
    similar: similarProducts,
  });
}

export async function addToCart(req: AuthenticatedRequest, res: Response): Promise<void> {
  const id = req.body.productId;
  const quantity = parseInt(req.body.productQuantity, 10) || 0;
  if (!id || quantity <= 0) {
    res.status(200).json({ success: false });
    return;
  }

  const productExists = await db.selectFrom('laptops')
    .select('id')
    .where('id', '=', id)
    .limit(1)
    .executeTakeFirst();
  if (!productExists) {
    res.status(400).json({ success: false, error: 'Invalid product ID' });
    return;
  }
  const customerId = getCustomerId(req);

  await db.insertInto('cart')
    .values({
      id: undefined,
      product_id: id,
      product_quantity: quantity,
      customer_id: customerId,
      date_added: undefined,
    })
    .onConflict((oc) => oc
      .columns(['customer_id', 'product_id'])
      .doUpdateSet({
        product_quantity: sql`cart.product_quantity + ${quantity}`,
      })
    )
    .execute();

  const cartCountResult = await getCartCountHelper(customerId);
  res.status(200).json({ cart: cartCountResult.total, success: true });
}

export async function getFromCart(req: AuthenticatedRequest, res: Response): Promise<void> {
  const customerId = getCustomerId(req);

  const cartRows = await db.selectFrom('cartview')
    .select([
      'brand_name',
      'img',
      'laptops_id',
      'name',
      'price',
      'product_quantity',
      'unique_id',
    ])
    .where('customer_id', '=', customerId)
    .orderBy('date_added', 'desc')
    .execute();

  let totalSum = 0;
  let totalQuantity = 0;
  for (const row of cartRows) {
    const qty = row.product_quantity || 0;
    const price = Number(row.price) || 0;
    totalSum += price * qty;
    totalQuantity += qty;
  }

  res.status(200).json({
    sum: { total: totalSum.toFixed(2) },
    data: cartRows,
    cart: totalQuantity,
  });
}

export async function getCheckoutInfo(req: AuthenticatedRequest, res: Response): Promise<void> {
  const customerId = getCustomerId(req);

  const cartRows = await db.selectFrom('cartview')
    .select([
      'brand_name',
      'img',
      'laptops_id',
      'name',
      'price',
      'product_quantity',
    ])
    .where('customer_id', '=', customerId)
    .orderBy('date_added', 'desc')
    .execute();

  if (cartRows.length === 0) {
    res.status(200).json({
      sum: { total: '0.00' },
      userInfo: [],
      data: [],
    });
    return;
  }

  let totalSum = 0;
  for (const row of cartRows) {
    const qty = row.product_quantity || 0;
    const price = Number(row.price) || 0;
    totalSum += price * qty;
  }

  const userInfoResult = await db.selectFrom('customers')
    .select(['address', 'city', 'fullname', 'state', 'zip'])
    .where('id', '=', customerId)
    .execute();

  res.status(200).json({
    sum: { total: totalSum.toFixed(2) },
    userInfo: userInfoResult,
    data: cartRows,
  });
}

export async function checkoutConfirm(req: CheckoutRequest, res: Response): Promise<void> {
  const customerId = getCustomerId(req);
  const userName = req.body.fullname;
  const userAddress = req.body.address;
  const userCity = req.body.city;
  const userState = req.body.state;
  const userZip = req.body.zip;

  if (!userName || typeof userName !== 'string' || userName.trim().length === 0 || userName.length > 70) {
    res.status(400).json({ error: 'Invalid name. Must be between 1 and 70 characters.' });
    return;
  }
  if (!userAddress || typeof userAddress !== 'string' || userAddress.trim().length === 0 || userAddress.length > 32) {
    res.status(400).json({ error: 'Invalid address. Must be between 1 and 32 characters.' });
    return;
  }
  if (!userCity || typeof userCity !== 'string' || userCity.trim().length === 0 || userCity.length > 32) {
    res.status(400).json({ error: 'Invalid city. Must be between 1 and 32 characters.' });
    return;
  }
  if (!userState || typeof userState !== 'string' || !/^[A-Z]{2}$/i.test(userState)) {
    res.status(400).json({ error: 'Invalid state. Must be a 2-letter state code.' });
    return;
  }
  if (!userZip || typeof userZip !== 'string' || !/^\d{5}$/.test(userZip)) {
    res.status(400).json({ error: 'Invalid zip. Must be a 5-digit zip code.' });
    return;
  }

  const cartRows = await db.selectFrom('cart')
    .selectAll()
    .where('customer_id', '=', customerId)
    .execute();

  if (cartRows.length === 0) {
    res.sendStatus(204);
    return;
  }

  const sumQuery = db.selectFrom('cartview')
    .select((eb) =>
      eb.fn<string>('sum', [sql`price * product_quantity`]).as('total')
    )
    .where('customer_id', '=', customerId);

  const orderlineInserted = await db.insertInto('orderline')
    .values({
      id: undefined,
      customer_id: customerId,
      order_total: sumQuery,
      date_added: undefined,
    })
    .returning('id')
    .executeTakeFirstOrThrow();

  const orderlineId = orderlineInserted.id;

  await db.insertInto('orders')
    .values(
      cartRows.map((item) => ({
        id: undefined,
        orderline_id: orderlineId,
        product_id: item.product_id,
        quantity: item.product_quantity,
        fullname: userName,
        address: userAddress,
        city: userCity,
        state: userState,
        zip: userZip,
      }))
    )
    .execute();

  await db.deleteFrom('cart')
    .where('customer_id', '=', customerId)
    .execute();

  res.status(200).json({ cart: 0, success: true });
}

export async function getUserOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
  const customerId = getCustomerId(req);

  const result = await db.selectFrom('orders')
    .innerJoin('laptops', 'laptops.id', 'orders.product_id')
    .innerJoin('orderline', 'orderline.id', 'orders.orderline_id')
    .select([
      'laptops.id as laptop_id',
      'laptops.name as laptop_name',
      'laptops.img',
      'laptops.price',
      'orderline.id as id',
      'orderline.order_total',
      'orderline.date_added',
      'orders.quantity',
      'orders.fullname',
      'orders.address',
      'orders.city',
      'orders.state',
      'orders.zip',
    ])
    .where('orderline.customer_id', '=', customerId)
    .orderBy('orderline.date_added', 'desc')
    .execute();

  res.status(200).json(result);
}

export async function removeFromCart(req: AuthenticatedRequest, res: Response): Promise<void> {
  const customerId = getCustomerId(req);
  const uniqueId = req.params.id;

  await db.deleteFrom('cart')
    .where('customer_id', '=', customerId)
    .where('id', '=', uniqueId)
    .execute();

  const cartCountResult = await getCartCountHelper(customerId);
  res.status(200).json({ cart: cartCountResult.total || 0, success: true });
}

export async function getOrderById(req: AuthenticatedRequest, res: Response): Promise<void> {
  const customerId = getCustomerId(req);
  const orderId = req.params.id;

  const result = await db.selectFrom('orders')
    .innerJoin('laptops', 'laptops.id', 'orders.product_id')
    .innerJoin('orderline', 'orderline.id', 'orders.orderline_id')
    .select([
      'laptops.id as laptop_id',
      'laptops.name as laptop_name',
      'laptops.img',
      'laptops.price',
      'orderline.id as id',
      'orderline.order_total',
      'orderline.date_added',
      'orders.quantity',
      'orders.fullname',
      'orders.address',
      'orders.city',
      'orders.state',
      'orders.zip',
    ])
    .where('orderline.customer_id', '=', customerId)
    .where('orders.orderline_id', '=', orderId)
    .execute();

  res.status(200).json({
    data: result,
    one: result.slice(0, 1),
  });
}

export async function getUserInfo(req: AuthenticatedRequest, res: Response): Promise<void> {
  const customerId = getCustomerId(req);

  const result = await db.selectFrom('customers')
    .select([
      'given_name',
      'fullname',
      'address',
      'city',
      'state',
      'zip',
      'phone',
      'date_added',
    ])
    .where('id', '=', customerId)
    .limit(1)
    .execute();

  res.status(200).json(result);
}

export async function updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  const customerId = getCustomerId(req);
  const givenName = req.body.given_name;
  const { fullname, address, city, state, zip } = req.body;

  if (!givenName || typeof givenName !== 'string' || givenName.trim().length === 0 || givenName.length > 70) {
    res.status(400).json({ error: 'Invalid given name. Must be between 1 and 70 characters.' });
    return;
  }
  if (!fullname || typeof fullname !== 'string' || fullname.trim().length === 0 || fullname.length > 70) {
    res.status(400).json({ error: 'Invalid full name. Must be between 1 and 70 characters.' });
    return;
  }
  if (!address || typeof address !== 'string' || address.trim().length === 0 || address.length > 32) {
    res.status(400).json({ error: 'Invalid address. Must be between 1 and 32 characters.' });
    return;
  }
  if (!city || typeof city !== 'string' || city.trim().length === 0 || city.length > 32) {
    res.status(400).json({ error: 'Invalid city. Must be between 1 and 32 characters.' });
    return;
  }
  if (!state || typeof state !== 'string' || !/^[A-Z]{2}$/i.test(state)) {
    res.status(400).json({ error: 'Invalid state. Must be a 2-letter state code.' });
    return;
  }
  if (!zip || typeof zip !== 'string' || !/^\d{5}$/.test(zip)) {
    res.status(400).json({ error: 'Invalid zip. Must be a 5-digit zip code.' });
    return;
  }

  await db.updateTable('customers')
    .set({
      given_name: givenName,
      fullname,
      address,
      city,
      state,
      zip,
    })
    .where('id', '=', customerId)
    .execute();
  res.sendStatus(200);
}
