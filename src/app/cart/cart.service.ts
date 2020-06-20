import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { UserService } from '../shared/user.service';
import { NavService } from '../shared/nav.service';

@Injectable()
export class CartService {
  baseUrl: string;

  constructor(
    public http: HttpClient,
    private navService: NavService,
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject('BASE_URL') baseUrl: string
  ) {
    this.baseUrl = baseUrl;
  }

  getCartById(): Observable<any> {
    const productUrl = `${this.baseUrl}/api/user/cart`;
    return this.http.get(productUrl).pipe(
      map((res: any) => {
        const cart = res.cart || 0;
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('id_cart', cart);
        }
        this.userService.setCart(cart);
        this.navService.changeCart(cart);
        return res;
      })
    );
  }

  removeFromCart(id): Observable<any> {
    const productUrl = `/api/user/cart/remove/${id}`;
    return this.http.delete(productUrl).pipe(
      map((res: any) => {
        if (res.success) {
          const cart = res.cart || 0;
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('id_cart', cart);
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
