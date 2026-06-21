import { NgModule, provideZonelessChangeDetection, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  NgbRatingModule,
  NgbDropdownModule,
  NgbModalModule,
} from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { SimpleNotificationsModule } from 'angular2-notifications';
import { provideHttpClient, withInterceptors, withJsonpSupport } from '@angular/common/http';
import { provideClientHydration, withNoIncrementalHydration, BrowserModule } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';


import { environment } from '../environments/environment';
import { AuthGuard } from './shared/auth.guard';
import { NavService } from './shared/nav.service';
import { UserService } from './shared/user.service';
import { cookiesInterceptor } from './interceptor';

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
import { AddNewComponent } from './add-new/add-new.component';

import { GroupByPipe } from './orders/groupby.pipe';
import { EllipsisPipe } from './home/ellipsis.pipe';

import { BASE_URL } from './shared/base-url.token';
import { REQUEST } from './express.tokens';

@NgModule({ declarations: [], bootstrap: [AppComponent],
    imports: [BrowserModule,
        AppComponent,
        CommonModule,
        FormsModule,
        RouterModule.forRoot(routes),
        NgbRatingModule,
        NgbDropdownModule,
        NgbModalModule,
        NgxPaginationModule,
        SimpleNotificationsModule.forRoot(), NavbarComponent,
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
        AddNewComponent],
    providers: [
        provideZonelessChangeDetection(),
        provideAnimations(),
        provideClientHydration(withNoIncrementalHydration()),
        { provide: BASE_URL, useFactory: getBaseUrl },
        AuthGuard,
        NavService,
        UserService,
        provideHttpClient(withInterceptors([cookiesInterceptor]), withJsonpSupport()),
    ] })
export class AppBrowserModule {}

export function getBaseUrl() {
  const platformId = inject(PLATFORM_ID);
  if (isPlatformBrowser(platformId)) {
    return environment.API_URL;
  }
  try {
    const req = inject(REQUEST, { optional: true });
    if (req) {
      const protocol = req.protocol;
      const host = req.get('host');
      return `${protocol}://${host}/demo`;
    }
  } catch (e) {
    console.error('Error injecting REQUEST in getBaseUrl:', e);
  }
  return environment.API_URL;
}
