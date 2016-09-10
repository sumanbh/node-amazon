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
    private _cartContent: Array<Object>;
    private _cartSum: number = 0;
    private _cartTotal: string;
    private _buttonDisabled: boolean = true;
    private _loginState: boolean = true;

    constructor(
        private cartService: CartService,
        private router: Router
    ) { }

    ngOnInit() { this.getCartInfo() }

    removeProduct(id) {
        this.cartService.removeFromCart(id)
            .subscribe(response => {
                function findProduct(product) {
                    return product.unique_id === response[0].id;
                }
                let productToRemove = this._cartContent.find(findProduct);
                this._cartSum -= parseFloat(productToRemove.price * productToRemove.product_quantity);
                this._cartTotal = this._cartSum.toFixed(2);
                this._cartSum ? this._buttonDisabled = false : this._buttonDisabled = true;
            })
    }

    getCartInfo() {
        this.cartService.getCartById()
            .subscribe(response => {
                this._cartContent = response;
                if (!this._cartContent || this._cartContent.length) this._buttonDisabled = false;
                else this._buttonDisabled = true;
                for (var prop in this._cartContent) {
                    this._cartSum += parseFloat(this._cartContent[prop].price * this._cartContent[prop].product_quantity);
                }
                this._cartTotal = this._cartSum.toFixed(2);
            },
            error => {
                this._loginState = false;
            })
    }
}