import { Injectable }     from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable }     from 'rxjs/Observable';

@Injectable()
export class OrdersService {

    constructor(
        private http: Http
    ) { }

    getOrdersById(): Observable<Object[]> {
        const ordersUrl = `api/user/orders`;  //api url
        return this.http.get(ordersUrl)
            .map((res: Response) => res.json());
    }
}