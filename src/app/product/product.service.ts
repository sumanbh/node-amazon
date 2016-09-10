import { Injectable }     from '@angular/core';
import { Http, Headers, Response } from '@angular/http';

@Injectable()
export class ProductService {

    constructor(
        private http: Http
    ) { }

    getProductById(id: string) {
        const productUrl = `api/product/${id}`;  //api url
        return this.http.get(productUrl)
            .map((res: Response) => res.json());
    }
    addToCart(id, quantity) {
        let cartInfo = JSON.stringify({ productId: id, productQuantity: quantity });
        let headers = new Headers({ 'Content-Type': 'application/json' });

        return this.http.post(`api/cart/add`, cartInfo, {headers: headers})
            .map((res:Response) => res.json())
    }
}