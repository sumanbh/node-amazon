import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { take } from 'rxjs/operators';

import { CheckoutService } from './checkout.service';
import { UserService } from '../shared/user.service';
import { CartItem, UserCheckoutInfo, CheckoutFormValue, CheckoutInfoResponse } from '../shared/types';
import { FormsModule } from '@angular/forms';
import { BASE_URL } from '../shared/base-url.token';

@Component({
    selector: 'app-checkout',
    providers: [CheckoutService],
    styleUrls: ['checkout.component.scss'],
    templateUrl: 'checkout.component.html',
    imports: [FormsModule, RouterLink]
})
export class CheckoutComponent implements OnInit {
  private checkoutService = inject(CheckoutService);
  private router = inject(Router);
  private titleService = inject(Title);
  private userService = inject(UserService);
  baseUrl = inject(BASE_URL);

  cartContent = signal<CartItem[]>([]);

  userInfo = signal<UserCheckoutInfo[] | undefined>(undefined);

  cartTotal = signal<string>('0.00');

  ngOnInit() {
    this.titleService.setTitle('Checkout');
    this.getCartInfo();
  }

  redirectToLogin() {
    this.userService.clearUser();
    this.router.navigate(['login']);
  }

  getCartInfo() {
    // get all the items on cart for the user
    this.checkoutService.getCartById().pipe(take(1)).subscribe({
      next: (response: CheckoutInfoResponse) => {
        this.userInfo.set(response.userInfo);
        const info = this.userInfo();
        if (!info || info.length === 0) {
          this.redirectToLogin();
        }
        this.cartContent.set(response.data);
        if (this.cartContent() && this.cartContent().length > 0) {
          this.cartTotal.set(response.sum.total || '0.00');
        } else {
          this.router.navigate(['user/cart']);
        }
      },
      error: (error) => {
        if (error && error.status === 401) {
          this.redirectToLogin();
        }
      }
    });
  }

  checkoutConfirm(value: CheckoutFormValue) {
    if (
      this.userInfo() &&
      value.fullname &&
      value.address &&
      value.city &&
      value.state &&
      value.zip
    ) {
      this.checkoutService.sendCheckout(value).pipe(take(1)).subscribe({
        next: (response) => {
          if (response) {
            this.router.navigate(['user/orders']);
          }
        },
        error: (error) => {
          if (error && error.status === 401) {
            this.redirectToLogin();
          }
        }
      });
    }
  }
}
