import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbRatingModule } from '@ng-bootstrap/ng-bootstrap/rating/rating.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { HttpModule, Http, RequestOptions, JsonpModule } from '@angular/http';
import { provideAuth, AuthHttp, AuthConfig } from 'angular2-jwt';
import { AuthGuard } from './shared/auth.guard';
import { NavService } from './shared/nav.service';

import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { routes } from './app.routes';
import { PageNotFoundComponent } from './pagenotfound/pagenotfound.component';
import { HomeComponent } from './home/home.component';
import { ProductComponent } from './product/product.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { OrdersComponent } from './orders/orders.component';
import { ProfileComponent } from './profile/profile.component';
import { LoginComponent } from './login/login.component';
import { ValidateComponent } from './validate/validate.component';

import { UserService } from './shared/user.service';
import { GroupByPipe } from './orders/groupby.pipe';
import { EllipsisPipe } from './home/ellipsis.pipe';

import 'rxjs/add/operator/map';

export function authHttpServiceFactory(http: Http, options: RequestOptions) {
  return new AuthHttp(new AuthConfig({}), http, options);
}

@NgModule({
  declarations: [
    NavbarComponent,
    AppComponent,
    PageNotFoundComponent,
    HomeComponent,
    ProductComponent,
    CartComponent,
    CheckoutComponent,
    OrdersComponent,
    ProfileComponent,
    GroupByPipe,
    EllipsisPipe,
    LoginComponent,
    ValidateComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    RouterModule.forRoot(routes),
    HttpModule,
    JsonpModule,
    NgbRatingModule,
    NgxPaginationModule,
    SimpleNotificationsModule,
    BrowserAnimationsModule,
  ],
  providers: [AuthGuard, {
    provide: AuthHttp,
    useFactory: authHttpServiceFactory,
    deps: [Http, RequestOptions]
  }, NavService, UserService],
  entryComponents: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule {

}
