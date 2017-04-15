import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { AuthHttp } from 'angular2-jwt';

@Injectable()
export class OrdersService {

    constructor(
        private authHttp: AuthHttp
    ) { }

    getOrdersById(): Observable<any> {
        const ordersUrl = `/api/user/orders`;  // api url
        return this.authHttp.get(ordersUrl)
            .map((res: Response) => res.json());
    }
}
