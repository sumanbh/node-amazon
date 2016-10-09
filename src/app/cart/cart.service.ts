import { Injectable }     from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from "rxjs/Observable";

@Injectable()
export class CartService {

    constructor(
        private http: Http
    ) { }

    getCartById(): Observable<any> {
        const productUrl = `/api/user/cart`;  //api url
        return this.http.get(productUrl)
            .map((res: Response) => res.json());
    }

    removeFromCart(id): Observable<any> {
        const productUrl = `/api/user/cart/remove/${id}`;
        return this.http.delete(productUrl)
            .map((res: Response) => res.json());
    }
}