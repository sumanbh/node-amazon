import { Injectable }     from '@angular/core';
import { Http, Headers, Response } from '@angular/http';

@Injectable()
export class CheckoutService {

    constructor(
        private http: Http
    ) { }

    getCartById() {
        const productUrl = `/api/user/checkout`;  //api url
        return this.http.get(productUrl)
            .map((res: Response) => res.json());
    }

    sendCheckout(value: any) {
        let headers = new Headers({ 'Content-Type': 'application/json' });

        const checkoutUrl = `/api/user/checkout/confirm`;
        return this.http.post(checkoutUrl, value, {headers: headers})
            .map((res: Response) => res.status);
    }
}