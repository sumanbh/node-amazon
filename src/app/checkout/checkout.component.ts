import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { CheckoutService } from './checkout.service';
import { LoadingBarService } from '@ngx-loading-bar/core';

@Component({
  selector: 'app-checkout',
  providers: [CheckoutService],
  styleUrls: ['checkout.component.scss'],
  templateUrl: 'checkout.component.html'
})
export class CheckoutComponent implements OnInit {
  cartContent = [];
  userInfo: Object;
  cartTotal = '0.00';

  constructor(
    private checkoutService: CheckoutService,
    private router: Router,
    private titleService: Title,
    private slimLoadingBarService: LoadingBarService
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Checkout');
    this.getCartInfo();
  }

  getCartInfo() {
    // start the loading bar animation
    this.slimLoadingBarService.start();

    // get all the items on cart for the user
    this.checkoutService.getCartById().subscribe(
      response => {
        this.slimLoadingBarService.complete();
        this.userInfo = response.userInfo;
        if (!this.userInfo) this.router.navigate(['login']);
        this.cartContent = response.data;
        if (this.cartContent) {
          this.cartTotal = response.sum.total;
        } else this.router.navigate(['user/cart']);
      },
      error => {
        if (error) this.router.navigate(['login']);
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
        response => {
          if (response) this.router.navigate(['user/orders']);
        },
        error => {
          if (error) this.router.navigate(['login']);
        }
      );
    }
  }
}
