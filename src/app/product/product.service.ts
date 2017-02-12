import { Injectable }     from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from "rxjs/Observable";

@Injectable()
export class ProductService {

    constructor(
        private http: Http
    ) { }

    getProductById(id: string): Observable<any> {
        const productUrl = `/api/product/${id}`;  //api url
        return this.http.get(productUrl)
            .map((res: Response) => res.json());
    }
    addToCart(id, quantity): Observable<any> {
        const cartInfo = JSON.stringify({ productId: id, productQuantity: quantity });
        const headers = new Headers({ 'Content-Type': 'application/json' });

        return this.http.post(`/api/cart/add`, cartInfo, {headers: headers})
            .map((res:Response) => res.status)
    }
}