// This file is auto-generated. Do not edit manually.

export interface BrandTable {
  id?: number;
  name?: string | null;
}

export interface CartTable {
  id?: string;
  product_id?: string | null;
  product_quantity: number;
  customer_id?: string | null;
  date_added?: Date | null;
}

export interface CartView {
  customer_id: string | null;
  unique_id: string | null;
  product_quantity: number | null;
  laptops_id: string | null;
  price: string | number | null;
  img: string | null;
  brand_name: string | null;
  name: string | null;
  date_added: Date | null;
}

export interface CheckoutView {
  customer_id: string | null;
  fullname: string | null;
  address: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  product_quantity: number | null;
  laptops_id: string | null;
  price: string | number | null;
  img: string | null;
  brand_name: string | null;
  name: string | null;
  date_added: Date | null;
}

export interface CustomersTable {
  id?: string;
  google_id?: string | null;
  facebook_id?: string | null;
  given_name?: string | null;
  fullname?: string | null;
  email?: string | null;
  password?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  local?: boolean | null;
  date_added?: Date | null;
}

export interface KyselymigrationTable {
  name: string;
  timestamp: string;
}

export interface KyselymigrationlockTable {
  id?: string;
  is_locked?: number;
}

export interface LaptopsTable {
  id?: string;
  name?: string | null;
  os_id?: number | null;
  processor_id?: number | null;
  brand_id?: number | null;
  img?: string | null;
  ram?: string | null;
  storage_type_id?: number | null;
  storage?: number | null;
  rating?: string | number | null;
  price?: string | number | null;
  img_big?: string | null;
  description?: string[] | null;
  date_added?: Date | null;
}

export interface OrderlineTable {
  id?: string | number;
  order_total?: string | number | null;
  customer_id?: string | null;
  date_added?: Date | null;
}

export interface OrdersTable {
  id?: string;
  orderline_id?: string | number | null;
  product_id?: string | null;
  quantity: number;
  fullname?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
}

export interface OsTable {
  id?: number;
  name?: string | null;
}

export interface ProcessorTable {
  id?: number;
  name?: string | null;
}

export interface StoragetypeTable {
  id?: number;
  name?: string | null;
}

export interface Database {
  brand: BrandTable;
  cart: CartTable;
  cartview: CartView;
  checkoutview: CheckoutView;
  customers: CustomersTable;
  kysely_migration: KyselymigrationTable;
  kysely_migration_lock: KyselymigrationlockTable;
  laptops: LaptopsTable;
  orderline: OrderlineTable;
  orders: OrdersTable;
  os: OsTable;
  processor: ProcessorTable;
  storage_type: StoragetypeTable;
}
