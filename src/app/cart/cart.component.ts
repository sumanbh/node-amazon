import { Component, OnInit } from '@angular/core';
import { CartService } from './cart.service';
import { Router } from '@angular/router';
import {
  trigger,
  state,
  style,
  transition,
  animate
} from '@angular/animations';
import { Title } from '@angular/platform-browser';
import { LoadingBarService } from '@ngx-loading-bar/core';

@Component({
  selector: 'app-cart',
  providers: [CartService],
  templateUrl: 'cart.component.html',
  styleUrls: ['cart.component.scss'],
  animations: [
    trigger('signal', [
      state(
        'void',
        style({
          opacity: 0,
          transform: 'translateX(20%)'
        })
      ),
      transition('* => void', [animate('400ms ease-in-out')]),
      state(
        'initial',
        style({
          opacity: 1
        })
      )
    ])
  ]
})
export class CartComponent implements OnInit {
  cartContent = [];
  cartTotal = '0.00';
  buttonDisabled = false;
  isFirst = true;
  animate = 'initial';

  constructor(
    private cartService: CartService,
    private router: Router,
    private titleService: Title,
    private loadingBarService: LoadingBarService
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Shopping Cart');
    this.getCartInfo();
  }

  removeProduct(id) {
    this.cartService.removeFromCart(id).subscribe(
      response => {
        this.getCartInfo();
      },
      error => {
        console.log(error);
      }
    );
  }

  getCartInfo() {
    // start the loading bar animation
    this.loadingBarService.start();

    this.cartService.getCartById().subscribe(
      response => {
        this.loadingBarService.complete();
        // initial load should be instant
        if (this.isFirst) {
          this.cartContent = response.data;
          this.isFirst = false;
        }
        if (response.data) {
          // because the delete animation takes 400ms
          setTimeout(() => (this.cartContent = response.data), 400);
          this.buttonDisabled = false;
          this.cartTotal = response.sum.total;
        } else {
          this.buttonDisabled = true;
          this.cartTotal = '0.00';
        }
      },
      error => {
        this.cartTotal = '0.00';
      }
    );
  }
}
