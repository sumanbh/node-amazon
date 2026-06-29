// This file is auto-generated. Do not edit manually.

export interface BrandTable {
  id?: number;
  name: string;
}

export interface CartTable {
  id?: string;
  product_id: string;
  product_quantity: number;
  customer_id: number;
  date_added?: Date;
  updated_at?: Date;
}

export interface CartView {
  customer_id: number | null;
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
  customer_id: number | null;
  fullname: string | null;
  address: string | null;
  city: string | null;
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
  id?: number;
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
  local?: boolean;
  date_added?: Date;
  updated_at?: Date;
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
  name: string;
  os_id: number;
  processor_id: number;
  brand_id: number;
  img?: string | null;
  ram: number;
  storage_type_id: number;
  storage: number;
  rating?: string | number | null;
  price: string | number;
  img_big?: string | null;
  description?: string[] | null;
  date_added?: Date;
  updated_at?: Date;
}

export interface OrderitemsTable {
  id?: number;
  order_id: string | number;
  product_id: string;
  quantity: number;
  fullname: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export interface OrdersTable {
  id?: string | number;
  order_total: string | number;
  customer_id: number;
  date_added?: Date;
}

export interface OsTable {
  id?: number;
  name: string;
}

export interface ProcessorTable {
  id?: number;
  name: string;
}

export interface StoragetypeTable {
  id?: number;
  name: string;
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
  order_items: OrderitemsTable;
  orders: OrdersTable;
  os: OsTable;
  processor: ProcessorTable;
  storage_type: StoragetypeTable;
}
