import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { AuthHttp } from 'angular2-jwt';
import { NavService } from '../shared/nav.service';

@Injectable()
export class ProductService {

    constructor(
        private http: Http,
        private authHttp: AuthHttp,
        private navService: NavService,
    ) { }

    getProductById(id: string): Observable<any> {
        const productUrl = `/api/product/${id}`;  // api url
        return this.http.get(productUrl)
            .map((res: Response) => res.json());
    }
    addToCart(id, quantity): Observable<any> {
        const cartInfo = JSON.stringify({ productId: id, productQuantity: quantity });
        const headers = new Headers({ Accept: 'application/json', 'Content-Type': 'application/json' });

        return this.authHttp.post(`/api/user/cart/add`, cartInfo, { headers })
            .map((res: Response) => res.json())
            .map(res => {
                if (res.success) {
                    localStorage.setItem('id_cart', res.cart || 0);
                    this.navService.changeCart(res.cart || 0);
                    return true;
                }
                return false;
            });
    }
}
