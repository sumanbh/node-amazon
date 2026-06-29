import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CartService } from './cart.service';
import { take } from 'rxjs/operators';

import { UserService } from '../shared/user.service';
import { CartItem, CartResponse } from '../shared/types';

@Component({
    selector: 'app-cart',
    providers: [CartService],
    templateUrl: 'cart.component.html',
    styleUrls: ['cart.component.scss'],
    imports: [RouterLink]
})
export class CartComponent implements OnInit {
  private cartService = inject(CartService);
  private router = inject(Router);
  private titleService = inject(Title);
  private userService = inject(UserService);

  cartContent = signal<CartItem[]>([]);

  cartTotal = signal<string>('0.00');

  buttonDisabled = signal<boolean>(false);

  isFirst = true;

  ngOnInit() {
    this.titleService.setTitle('Shopping Cart');
    this.getCartInfo();
  }

  removeProduct(id: string) {
    const itemIndex = this.cartContent().findIndex(item => item.unique_id === id);
    if (itemIndex !== -1) {
      this.cartContent.update(content => content.map((item, idx) => idx === itemIndex ? { ...item, hideme: true } : item));
      this.cartService.removeFromCart(id).pipe(take(1)).subscribe({
        next: () => {
          this.getCartInfo();
        },
        error: (error) => {
          console.error(error);
        }
      });
    }
  }

  getCartInfo() {
    this.cartService.getCartById().pipe(take(1)).subscribe({
      next: (response: CartResponse) => {
        // initial load should be instant
        if (this.isFirst) {
          this.cartContent.set(response.data);
          this.isFirst = false;
        }
        if (response.data && response.data.length > 0) {
          // because the delete animation takes 400ms
          setTimeout(() => this.cartContent.set(response.data), 400);
          this.buttonDisabled.set(false);
          this.cartTotal.set(response.sum.total || '0.00');
        } else {
          setTimeout(() => this.cartContent.set([]), 400);
          this.buttonDisabled.set(true);
          this.cartTotal.set('0.00');
        }
      },
      error: (error) => {
        this.cartTotal.set('0.00');
        if (error && error.status === 401) {
          this.userService.clearUser();
          this.router.navigate(['login']);
        }
      }
    });
  }
}
