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
    cartContent: any; // TODO
    userInfo: any;
    cartTotal = '0.00';

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
                this.userInfo = response.userInfo;
                if (!this.userInfo) this.router.navigate(['login']);
                this.cartContent = response.data;
                if (this.cartContent) {
                    this.cartTotal = response.sum.total;
                } else this.router.navigate(['user/cart']);
            },
            error => {
                if (error) this.router.navigate(['login']);
            });
    }

    checkoutConfirm(value: any) {
        if (this.userInfo && value.fullname && value.address && value.city && value.state && value.zip) {
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
