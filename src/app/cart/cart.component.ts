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
    _cartTotal = '0.00';
    _buttonDisabled = true;

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
                console.log(error);
            });
    }

    getCartInfo() {
        this.cartService.getCartById()
            .subscribe(response => {
                this._cartContent = response.data;
                if (this._cartContent) {
                    this._buttonDisabled = false;
                    this._cartTotal = response.sum.total;
                } else {
                    this._buttonDisabled = true;
                    this._cartTotal = '0.00';
                }
            },
            error => {
                this._cartTotal = '0.00';
            });
    }
}
