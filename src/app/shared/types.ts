import { Brand } from '../home/interfaces/brands.interface';
import { OS } from '../home/interfaces/os.interface';
import { Processor } from '../home/interfaces/processor.interface';
import { RAM } from '../home/interfaces/ram.interface';
import { Storage } from '../home/interfaces/storage.interface';

export interface NewLaptop {
  title: string;
  image: string;
  ram: string | number | null;
  storage: string | number | null;
  description: string[];
  os: string | null;
  processor: string | null;
  storageType: string | null;
  brand: string | null;
  limit: boolean;
  price: string | number | null;
  rating: string | number | null;
}

export interface NewLaptopResponse {
  success: boolean;
  id?: string;
  errors?: string[];
}

export interface CartItem {
  brand_name: string;
  img: string;
  laptops_id: string;
  name: string;
  price: string;
  product_quantity: number;
  unique_id: string;
  hideme?: boolean;
}

export interface CartResponse {
  sum: {
    total: string | null;
  };
  data: CartItem[];
  cart: number;
}

export interface UserCheckoutInfo {
  address: string | null;
  city: string | null;
  fullname: string | null;
  state: string | null;
  zip: string | null;
}

export interface CheckoutInfoResponse {
  sum: {
    total: string | null;
  };
  userInfo: UserCheckoutInfo[];
  data: CartItem[];
}

export interface CheckoutFormValue {
  fullname: string;
  address: string;
  city: string;
  state: string;
  zip: string | number;
}

export interface CheckoutConfirmResponse {
  success: boolean;
  cart?: number;
}

export interface OrderItem {
  laptop_id: string;
  laptop_name: string;
  img: string;
  price: string;
  id: string;
  order_total: string;
  date_added: string;
  quantity: number;
  fullname: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export interface GroupedOrder extends OrderItem {
  prop: string;
  value: OrderItem[];
}

export interface LaptopProduct {
  id: string;
  laptop_name: string;
  img: string;
  ram: string;
  storage: number;
  img_big: string;
  price: string;
  rating: number | string;
  description: string[];
  os_name: string;
  brand_name: string;
  storage_name: string;
}

export interface ProductDetailsResponse {
  product: LaptopProduct[];
  similar: LaptopProduct[];
}

export interface ProductSummary {
  id: string;
  img: string;
  price: string;
  rating: number | string;
  name: string;
}

export interface AllProductsResponse {
  total: number;
  data: ProductSummary[];
}

export interface GetProductsParams {
  brand?: Brand;
  os?: OS;
  processor?: Processor;
  ram?: RAM;
  storage?: Storage;
  page: number;
  search?: string;
  price?: string;
  minCustom?: number | null;
  maxCustom?: number | null;
}

export interface AddToCartResponse {
  success: boolean;
  cart?: number;
}
