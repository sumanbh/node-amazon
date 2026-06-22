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
    res.status(200).json({ name: null, cart: null });
  }
}

export async function getAllProducts(req: Request, res: Response): Promise<void> {
  const offset = (parseInt(req.params.page, 10) - 1) * 24;
  const limit = 24;
  const obj = JSON.parse(req.query.obj as string);
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
        const searchTerm = obj[value];
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
    const searchPattern = `%${search.replace(/-/g, ' ').trim() || ' '}%`;
    query = query.where((eb) =>
      eb(
        eb.fn('translate', [eb.fn('lower', ['laptops.name']), eb.val('-'), eb.val(' ')]),
        'like',
        searchPattern
      )
    );
  }

  query = query.orderBy('laptops.rating', 'desc');

  const rows = await query.execute();
  const total = rows.length;
  const paginatedData = rows.slice(offset, offset + limit);

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
  const customerId = getCustomerId(req);

  const [cartItem, cartCountResult] = await Promise.all([
    db.selectFrom('cart')
      .selectAll()
      .where('product_id', '=', id)
      .where('customer_id', '=', customerId)
      .executeTakeFirst(),
    getCartCountHelper(customerId),
  ]);

  if (!cartItem) {
    await db.insertInto('cart')
      .values({
        id: undefined,
        product_id: id,
        product_quantity: quantity,
        customer_id: customerId,
        date_added: undefined,
      })
      .execute();
    const cartCount = cartCountResult.total + quantity;
    res.status(200).json({ cart: cartCount, success: true });
  } else {
    const newLength = cartItem.product_quantity + quantity;
    await db.updateTable('cart')
      .set({
        product_quantity: newLength,
      })
      .where('customer_id', '=', customerId)
      .where('product_id', '=', id)
      .execute();
    const cartCount = cartCountResult.total + quantity;
    res.status(200).json({ cart: cartCount, success: true });
  }
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

  if (cartRows.length === 0) {
    res.status(200).json({
      sum: { total: '0.00' },
      data: [],
      cart: 0,
    });
    return;
  }

  const [sumResult, cartCountResult] = await Promise.all([
    db.selectFrom('cartview')
      .select((eb) =>
        eb.fn<string>('sum', [
          sql`price * product_quantity`
        ]).as('total')
      )
      .where('customer_id', '=', customerId)
      .executeTakeFirst(),
    getCartCountHelper(customerId),
  ]);

  res.status(200).json({
    sum: { total: sumResult?.total || '0.00' },
    data: cartRows,
    cart: cartCountResult.total || 0,
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

  const [sumResult, userInfoResult] = await Promise.all([
    db.selectFrom('cartview')
      .select((eb) =>
        eb.fn<string>('sum', [
          sql`price * product_quantity`
        ]).as('total')
      )
      .where('customer_id', '=', customerId)
      .executeTakeFirst(),
    db.selectFrom('customers')
      .select(['address', 'city', 'fullname', 'state', 'zip'])
      .where('id', '=', customerId)
      .execute(),
  ]);

  res.status(200).json({
    sum: { total: sumResult?.total || '0.00' },
    userInfo: userInfoResult,
    data: cartRows,
  });
}

export async function checkoutConfirm(req: AuthenticatedRequest, res: Response): Promise<void> {
  const customerId = getCustomerId(req);
  const userName = req.body.fullname;
  const userAddress = req.body.address;
  const userCity = req.body.city;
  const userState = req.body.state;
  const userZip = req.body.zip;

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

  if (givenName && fullname && address && city && state && zip) {
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
  } else {
    res.sendStatus(400);
  }
}
