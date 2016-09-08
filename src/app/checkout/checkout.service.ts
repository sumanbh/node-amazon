import { Injectable }     from '@angular/core';
import { Http, Headers, Response } from '@angular/http';

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

    sendCheckout(): Observable<Object[]> {
        let userInfo = {
            userName: document.getElementById('userName').value,
            userAddress: document.getElementById('userAddress').value,
            userCity: document.getElementById('userCity').value,
            userState: document.getElementById('userState').value,
            userZip: document.getElementById('userZip').value
        }
        let headers = new Headers({ 'Content-Type': 'application/json' });

        const checkoutUrl = `api/user/checkout/confirm`;
        return this.http.post(checkoutUrl, userInfo, {headers: headers})
            .map((res: Response) => res.json());
    }
}