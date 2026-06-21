import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { NavService } from '../shared/nav.service';
import { ProductDetailsResponse, AddToCartResponse } from '../shared/types';
import { BASE_URL } from '../shared/base-url.token';

@Injectable()
export class ProductService {
  private http = inject(HttpClient);
  private navService = inject(NavService);
  private platformId = inject(PLATFORM_ID);
  baseUrl = inject(BASE_URL);

  getProductById(id: string): Observable<ProductDetailsResponse> {
    const productUrl = `/api/product/${id}`; // api url
    return this.http.get<ProductDetailsResponse>(this.baseUrl + productUrl);
  }

  addToCart(id: string, quantity: number): Observable<boolean> {
    const cartInfo = JSON.stringify({
      productId: id,
      productQuantity: quantity
    });
    const headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json'
    });

    return this.http.post<AddToCartResponse>(this.baseUrl + '/api/user/cart/add', cartInfo, { headers }).pipe(
      map((res) => {
        if (res.success) {
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('id_cart', String(res.cart || 0));
          }
          this.navService.changeCart(res.cart || 0);
          return true;
        }
        return false;
      })
    );
  }
}
