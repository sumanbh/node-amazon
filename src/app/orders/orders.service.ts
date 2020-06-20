import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class OrdersService {
  baseUrl: string;

  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  getOrdersById(): Observable<any> {
    const ordersUrl = `${this.baseUrl}/api/user/orders`;
    return this.http.get(ordersUrl);
  }
}
