import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs';
import { AuthHttp } from 'angular2-jwt';
import { map } from 'rxjs/operators';

@Injectable()
export class OrdersService {
  constructor(private authHttp: AuthHttp) {}

  getOrdersById(): Observable<any> {
    const ordersUrl = `/api/user/orders`; // api url
    return this.authHttp
      .get(ordersUrl)
      .pipe(map((res: Response) => res.json()));
  }
}
