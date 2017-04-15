import { Routes, RouterModule } from '@angular/router';

import { PageNotFoundComponent } from './pagenotfound/pagenotfound.component';
import { HomeComponent } from './home/home.component';
import { ProductComponent } from './product/product.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { OrdersComponent } from './orders/orders.component';
import { ProfileComponent } from './profile/profile.component';
import { LoginComponent } from './login/login.component';
import { ValidateComponent } from './validate/validate.component';
import { AuthGuard } from './shared/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'validate',
    component: ValidateComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'product/:id',
    component: ProductComponent
  },
  {
    path: 'user/cart',
    component: CartComponent, canActivate: [AuthGuard]
  },
  {
    path: 'user/checkout',
    component: CheckoutComponent, canActivate: [AuthGuard]
  },
  {
    path: 'user/orders',
    component: OrdersComponent, canActivate: [AuthGuard]
  },
  {
    path: 'user/settings',
    component: ProfileComponent, canActivate: [AuthGuard]
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];
