import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { NavService } from '../shared/nav.service';
import { CheckoutInfoResponse, CheckoutFormValue, CheckoutConfirmResponse } from '../shared/types';
import { BASE_URL } from '../shared/base-url.token';

@Injectable()
export class CheckoutService {
  private http = inject(HttpClient);
  private navService = inject(NavService);
  baseUrl = inject(BASE_URL);

  getCartById(): Observable<CheckoutInfoResponse> {
    const productUrl = `${this.baseUrl}/api/user/checkout`; // api url
    return this.http.get<CheckoutInfoResponse>(productUrl);
  }

  sendCheckout(value: CheckoutFormValue): Observable<boolean> {
    const headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
    const checkoutUrl = `${this.baseUrl}/api/user/checkout/confirm`;
    return this.http.post<CheckoutConfirmResponse>(checkoutUrl, value, { headers }).pipe(
      map((res) => {
        if (res.success) {
          localStorage.setItem('id_cart', String(res.cart || 0));
          this.navService.changeCart(res.cart || 0);
          return true;
        }
        return false;
      })
    );
  }
}
