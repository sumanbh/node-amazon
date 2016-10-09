import { Injectable }     from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from "rxjs/Observable";

@Injectable()
export class CheckoutService {

    constructor(
        private http: Http
    ) { }

    getCartById(): Observable<any> {
        const productUrl = `/api/user/checkout`;  //api url
        return this.http.get(productUrl)
            .map((res: Response) => res.json());
    }

    sendCheckout(value: any): Observable<any> {
        let headers = new Headers({ 'Content-Type': 'application/json' });

        const checkoutUrl = `/api/user/checkout/confirm`;
        return this.http.post(checkoutUrl, value, {headers: headers})
            .map((res: Response) => res.status);
    }
}