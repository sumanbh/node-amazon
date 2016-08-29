import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router'

import { CheckoutService } from './checkout.service'

@Component({
    selector: 'checkout',
    providers: [CheckoutService],
    styleUrls: ['checkout.component.css'],
    templateUrl: 'checkout.component.html'
})
export class CheckoutComponent implements OnInit {
    private _cartContent: Array<Object>;
    private _userInfo: Object;
    private _loginStatus: boolean = false;
    private _cartSum: number = 0;
    private _cartTotal: string;

    constructor(
        private checkoutService: CheckoutService,
        private router: Router
    ) { }

    ngOnInit() {
        this.getCartInfo()
    }

    getCartInfo() {
        this.checkoutService.getCartById()
            .subscribe(response => {
                console.log("CheckoutComponent: ", response);
                this._userInfo = response.userInfo;
                this._cartContent = response.data;
                for (var prop in this._cartContent) {
                    this._cartSum += parseFloat(this._cartContent[prop].price);
                }
                this._cartTotal = this._cartSum.toFixed(2);
            })
    }

    checkoutConfirm() {
        if (this._userInfo) {
            this.checkoutService.sendCheckout()
                .subscribe(response => {
                    this.router.navigate(['/']);
                    console.log(response);
                })
        }
    }
}