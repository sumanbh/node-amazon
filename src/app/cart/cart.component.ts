import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CartService } from './cart.service';

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

    constructor(
        private cartService: CartService
    ) { }

    ngOnInit() { this.getCartInfo() }

    getCartInfo() {
        this.cartService.getCartById()
            .subscribe( response => {
                this._cartContent = response.data;
                console.log(response.data);
                for (var prop in this._cartContent){
                    this._cartSum += parseFloat(this._cartContent[prop].price);
                }
                this._cartTotal = this._cartSum.toFixed(2);
            })
    }
}