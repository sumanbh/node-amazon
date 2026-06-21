import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { OrderItem } from '../shared/types';
import { BASE_URL } from '../shared/base-url.token';

@Injectable()
export class OrdersService {
  private http = inject(HttpClient);
  baseUrl = inject(BASE_URL);

  getOrdersById(): Observable<OrderItem[]> {
    const ordersUrl = `${this.baseUrl}/api/user/orders`;
    return this.http.get<OrderItem[]>(ordersUrl);
  }
}
