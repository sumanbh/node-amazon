import { provideRouter, RouterConfig } from '@angular/router';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ShopComponent } from './shop/shop.component';


export const routes: RouterConfig = [
  { 
    path: '', 
    component: HomeComponent 
  },
  {
    path: 'shop',
    component: ShopComponent
  }
];