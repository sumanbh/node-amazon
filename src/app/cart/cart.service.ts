import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UserService } from '../shared/user.service';
import { NavService } from '../shared/nav.service';
import { CartResponse, AddToCartResponse } from '../shared/types';
import { BASE_URL } from '../shared/base-url.token';

@Injectable()
export class CartService {
  http = inject(HttpClient);
  private navService = inject(NavService);
  private userService = inject(UserService);
  private platformId = inject(PLATFORM_ID);
  baseUrl = inject(BASE_URL);

  getCartById(): Observable<CartResponse> {
    const productUrl = `${this.baseUrl}/api/user/cart`;
    return this.http.get<CartResponse>(productUrl).pipe(
      map((res) => {
        const cart = res.cart || 0;
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('id_cart', String(cart));
        }
        this.userService.setCart(cart);
        this.navService.changeCart(cart);
        return res;
      })
    );
  }

  removeFromCart(id: string): Observable<boolean> {
    const productUrl = `${this.baseUrl}/api/user/cart/remove/${id}`;
    return this.http.delete<AddToCartResponse>(productUrl).pipe(
      map((res) => {
        if (res.success) {
          const cart = res.cart || 0;
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('id_cart', String(cart));
          }
          this.userService.setCart(cart);
          this.navService.changeCart(cart);
          return true;
        }
        return false;
      })
    );
  }
}
