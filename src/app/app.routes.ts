import { Routes, RouterModule } from '@angular/router';

import { PageNotFoundComponent } from './pagenotfound/pagenotfound.component';
import { ShopComponent } from './shop/shop.component';
import { ProductComponent } from './product/product.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { OrdersComponent } from './orders/orders.component';
// import { OrderDetailsComponent } from './orderdetails/orderdetails.component';
import { ProfileComponent } from './profile/profile.component';

export const routes: Routes = [
  {
    path: '',
    component: ShopComponent
  },
  {
    path: 'shop',
    component: ShopComponent
  },
  {
    path: 'product/:id',
    component: ProductComponent
  },
  {
    path: 'user/cart',
    component: CartComponent
  },
  {
    path: 'user/checkout',
    component: CheckoutComponent
  },
  {
    path: 'user/orders',
    component: OrdersComponent
  },
  // {
  //   path: 'user/orders/:id',
  //   component: OrderDetailsComponent
  // },
  {
    path: 'user/settings',
    component: ProfileComponent
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];