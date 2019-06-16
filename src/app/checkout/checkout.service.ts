import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavService } from '../shared/nav.service';
import { map } from 'rxjs/operators';

@Injectable()
export class CheckoutService {
  constructor(private http: HttpClient, private navService: NavService) {}

  getCartById(): Observable<any> {
    const productUrl = `/api/user/checkout`; // api url
    return this.http
      .get(productUrl);
  }

  sendCheckout(value: any): Observable<any> {
    const headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json'
    });
    const checkoutUrl = `/api/user/checkout/confirm`;
    return this.http.post(checkoutUrl, value, { headers: headers }).pipe(
      map((res: any) => {
        if (res.success) {
          localStorage.setItem('id_cart', res.cart || 0);
          this.navService.changeCart(res.cart || 0);
          return true;
        }
        return false;
      })
    );
  }
}
