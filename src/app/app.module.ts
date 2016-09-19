import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpModule, JsonpModule } from '@angular/http';
import { NgbRatingModule } from '@ng-bootstrap/ng-bootstrap/rating/rating.module';

import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { routes } from './app.routes';
import { PageNotFoundComponent } from './pagenotfound/pagenotfound.component';
import { ShopComponent } from './shop/shop.component';
import { ProductComponent } from './product/product.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { OrdersComponent } from './orders/orders.component';
// import { OrderDetailsComponent } from './orderdetails/orderdetails.component';
import { ProfileComponent } from './profile/profile.component';

import { GroupByPipe } from './orders/groupby.pipe';
import { EllipsisPipe } from './shop/ellipsis.pipe';
import { Ng2PaginationModule } from 'ng2-pagination';

import { GlobalEvent } from './shared/global.event';
import 'rxjs/add/operator/map';

@NgModule({
  declarations: [
    NavbarComponent,
    AppComponent,
    PageNotFoundComponent,
    ShopComponent,
    ProductComponent,
    CartComponent,
    CheckoutComponent,
    OrdersComponent,
    // OrderDetailsComponent,
    ProfileComponent,
    GroupByPipe,
    EllipsisPipe
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    RouterModule.forRoot(routes),
    HttpModule,
    JsonpModule,
    NgbRatingModule,
    Ng2PaginationModule,
  ],
  providers: [],
  entryComponents: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
  
}