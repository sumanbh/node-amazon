import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CartService } from './cart.service';
import { Router } from '@angular/router';


@Component({
    selector: 'app-cart',
    providers: [CartService],
    templateUrl: 'cart.component.html',
    styleUrls: ['cart.component.css']
})
export class CartComponent implements OnInit {
    _cartContent: any;
    _cartTotal: string;
    _buttonDisabled = true;
    _loginState = true;

    constructor(
        private cartService: CartService,
        private router: Router
    ) { }

    ngOnInit() { this.getCartInfo(); }

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
                this._cartContent = response.data;
                if (this._cartContent) {
                    const totalArr = response.total;
                    this._buttonDisabled = false;
                    this._cartTotal = totalArr[0].total;
                } else {
                    this._buttonDisabled = true;
                    this._cartTotal = '0.00';
                }
            },
            error => {
                this._loginState = false;
            });
    }
}