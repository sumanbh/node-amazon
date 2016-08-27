import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { CartService } from './cart.service';

@Component({
    selector: 'cart',
    providers: [CartService],
    templateUrl: 'cart.component.html'
})
export class CartComponent implements OnInit {
    constructor(
        private cartService: CartService
    ) { }

    ngOnInit() { this.getCartInfo() }

    getCartInfo() {
        this.cartService.getCartById()
            .subscribe( response => {
                console.log(response);
            })
    }
}