import { Injectable }     from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable }     from 'rxjs/Observable';

@Injectable()
export class CheckoutService {

    constructor(
        private http: Http
    ) { }

    getCartById(): Observable<Object[]> {
        const productUrl = `api/user/checkout`;  //api url
        return this.http.get(productUrl)
            .map((res: Response) => res.json());
    }
}