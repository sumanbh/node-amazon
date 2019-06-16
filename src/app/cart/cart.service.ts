import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NavService } from '../shared/nav.service';
import { map } from 'rxjs/operators';

@Injectable()
export class CartService {
  constructor(
    public http: HttpClient,
    private navService: NavService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  getCartById(): Observable<any> {
    const productUrl = `/api/user/cart`; // api url
    return this.http.get(productUrl).pipe(
      map((res: any) => {
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('id_cart', res.cart || 0);
        }
        this.navService.changeCart(res.cart || 0);
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
          this.navService.changeCart(cart);
          return true;
        }
        return false;
      })
    );
  }
}
