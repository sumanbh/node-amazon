import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { NavService } from '../shared/nav.service';

@Injectable()
export class CheckoutService {
  baseUrl: string;

  constructor(
    private http: HttpClient,
    private navService: NavService,
    @Inject('BASE_URL') baseUrl: string
  ) {
    this.baseUrl = baseUrl;
  }

  getCartById(): Observable<any> {
    const productUrl = `${this.baseUrl}/api/user/checkout`; // api url
    return this.http.get(productUrl);
  }

  sendCheckout(value: any): Observable<any> {
    const headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
    const checkoutUrl = `${this.baseUrl}/api/user/checkout/confirm`;
    return this.http.post(checkoutUrl, value, { headers }).pipe(
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
