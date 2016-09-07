import { provideRouter, RouterConfig } from '@angular/router';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ShopComponent } from './shop/shop.component';
import { ProductComponent } from './product/product.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { OrdersComponent } from './orders/orders.component';

export const routes: RouterConfig = [
  { 
    path: '', 
    component: ShopComponent //replace with HomeComponent 
  },
  {
    path: 'shop',
    component: ShopComponent
  },
  {
    path:'product/:id',
    component: ProductComponent
  },
  {
    path:'user/cart',
    component: CartComponent
  },
  {
    path:'user/checkout',
    component: CheckoutComponent
  },
  {
    path: 'user/orders',
    component: OrdersComponent
  }
];