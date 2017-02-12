import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CartService } from './cart.service';
import { Router } from '@angular/router';


@Component({
    selector: 'cart',
    providers: [CartService],
    templateUrl: 'cart.component.html',
    styleUrls: ['cart.component.css']
})
export class CartComponent implements OnInit {
    _cartContent: any;
    _cartSum: number = 0;
    _cartTotal: string;
    _buttonDisabled: boolean = true;
    _loginState: boolean = true;

    constructor(
        private cartService: CartService,
        private router: Router
    ) { }

    ngOnInit() { this.getCartInfo() }

    removeProduct(id) {
        this.cartService.removeFromCart(id)
            .subscribe(response => {
                this.getCartInfo();
            },
            error => {
                this._loginState = false;
            });
    }

    getCartInfo() {
        this.cartService.getCartById()
            .subscribe(response => {
                let tempTotal = 0;
                this._cartContent = response;
                if (!this._cartContent || this._cartContent.length) this._buttonDisabled = false;
                else this._buttonDisabled = true;
                if (!this._buttonDisabled) {
                    for (var prop in this._cartContent) {
                        tempTotal += parseFloat(this._cartContent[prop].price) * parseFloat(this._cartContent[prop].product_quantity);
                    }
                    this._cartSum = tempTotal;
                    this._cartTotal = this._cartSum.toFixed(2);
                } else this._cartTotal = '0.00';
            },
            error => {
                this._loginState = false;
            })
    }
}