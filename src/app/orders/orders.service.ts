import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class OrdersService {
  constructor(private http: HttpClient) {}

  getOrdersById(): Observable<any> {
    const ordersUrl = `/api/user/orders`; // api url
    return this.http
      .get(ordersUrl);
  }
}
