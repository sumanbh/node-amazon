import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { CheckoutService } from './checkout.service';
import { UserService } from '../shared/user.service';

@Component({
  selector: 'app-checkout',
  providers: [CheckoutService],
  styleUrls: ['checkout.component.scss'],
  templateUrl: 'checkout.component.html',
})
export class CheckoutComponent implements OnInit {
  baseUrl: string;

  cartContent = [];

  userInfo: Object;

  cartTotal = '0.00';

  constructor(
    private checkoutService: CheckoutService,
    private router: Router,
    private titleService: Title,
    private userService: UserService,
    @Inject('BASE_URL') baseUrl: string
  ) {
    this.baseUrl = baseUrl;
  }

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
    this.checkoutService.getCartById().subscribe(
      (response) => {
        this.userInfo = response.userInfo;
        if (!this.userInfo) {
          this.redirectToLogin();
        }
        this.cartContent = response.data;
        if (this.cartContent) {
          this.cartTotal = response.sum.total;
        } else {
          this.router.navigate(['user/cart']);
        }
      },
      (error) => {
        if (error && error.status === 401) {
          this.redirectToLogin();
        }
      }
    );
  }

  checkoutConfirm(value: any) {
    if (
      this.userInfo &&
      value.fullname &&
      value.address &&
      value.city &&
      value.state &&
      value.zip
    ) {
      this.checkoutService.sendCheckout(value).subscribe(
        (response) => {
          if (response) {
            this.router.navigate(['user/orders']);
          }
        },
        (error) => {
          if (error && error.status === 401) {
            this.redirectToLogin();
          }
        }
      );
    }
  }
}
