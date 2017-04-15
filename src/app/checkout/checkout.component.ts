import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CheckoutService } from './checkout.service';

@Component({
    selector: 'app-checkout',
    providers: [CheckoutService],
    styleUrls: ['checkout.component.css'],
    templateUrl: 'checkout.component.html'
})
export class CheckoutComponent implements OnInit {
    _cartContent: any; // TODO
    _userInfo: any;
    _cartTotal = '0.00';
    _loginStatus = false;
    _cartSum = 0;

    constructor(
        private checkoutService: CheckoutService,
        private router: Router,
    ) { }

    ngOnInit() {
        this.getCartInfo();
    }

    getCartInfo() {
        this.checkoutService.getCartById()
            .subscribe(response => {
                this._userInfo = response.userInfo;
                if (!this._userInfo) this.router.navigate(['login']);
                this._cartContent = response.data;
                if (this._cartContent) {
                    this._cartTotal = response.sum.total;
                } else this.router.navigate(['user/cart']);
                this._cartSum = parseFloat(this._cartTotal);
            },
            error => {
                if (error) this.router.navigate(['login']);
            });
    }

    checkoutConfirm(value: any) {
        if (this._userInfo && value.fullname && value.address && value.city && value.state && value.zip) {
            this.checkoutService.sendCheckout(value)
                .subscribe(response => {
                    if (response) this.router.navigate(['user/orders']);
                },
                error => {
                    if (error) this.router.navigate(['login']);
                });
        }
    }
}
