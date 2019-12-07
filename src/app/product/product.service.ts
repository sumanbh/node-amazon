import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { NavService } from '../shared/nav.service';

@Injectable()
export class ProductService {
  baseUrl: string;

  constructor(
    private http: HttpClient,
    private navService: NavService,
    @Inject('BASE_URL') baseUrl: string,
    @Inject(PLATFORM_ID) private platformId: Object
    ) {
    this.baseUrl = baseUrl;
  }

  getProductById(id: string): Observable<any> {
    const productUrl = `/api/product/${id}`; // api url
    return this.http.get(this.baseUrl + productUrl);
  }

  addToCart(id, quantity): Observable<any> {
    const cartInfo = JSON.stringify({
      productId: id,
      productQuantity: quantity
    });
    const headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json'
    });

    return this.http.post(`/api/user/cart/add`, cartInfo, { headers }).pipe(
      map((res: any) => {
        if (res.success) {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('id_cart', res.cart || 0);
          }
          this.navService.changeCart(res.cart || 0);
          return true;
        }
        return false;
      })
    );
  }
}
