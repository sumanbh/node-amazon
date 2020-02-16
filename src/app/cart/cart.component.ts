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

import { UserService } from '../shared/user.service';

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
    private userService: UserService,
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Shopping Cart');
    this.getCartInfo();
  }

  removeProduct(id) {
    const itemIndex = this.cartContent.findIndex(item => item.unique_id === id);
    if (itemIndex !== -1) {
      this.cartContent[itemIndex].hideme = true;
      this.cartService.removeFromCart(id).subscribe(
        () => {
          this.getCartInfo();
        },
        error => {
          console.error(error);
        }
      );
    }
  }

  getCartInfo() {
    this.cartService.getCartById().subscribe(
      response => {
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
        if (error && error.status === 401) {
          this.userService.clearUser();
          this.router.navigate(['login']);
        }
      }
    );
  }
}
