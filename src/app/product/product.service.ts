import { Injectable, Inject } from '@angular/core';
import { Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { AuthHttp } from 'angular2-jwt';
import { NavService } from '../shared/nav.service';
import { TransferHttp } from '../../modules/transfer-http/transfer-http';
import { map } from 'rxjs/operators';

@Injectable()
export class ProductService {
    baseUrl: string;

    constructor(
        private http: TransferHttp,
        private authHttp: AuthHttp,
        private navService: NavService,
        @Inject('BASE_URL') baseUrl: string,
    ) {
        this.baseUrl = baseUrl;
    }

    getProductById(id: string): Observable<any> {
        const productUrl = `/api/product/${id}`;  // api url
        return this.http.get(this.baseUrl + productUrl);
    }

    addToCart(id, quantity): Observable<any> {
        const cartInfo = JSON.stringify({ productId: id, productQuantity: quantity });
        const headers = new Headers({ Accept: 'application/json', 'Content-Type': 'application/json' });

        return this.authHttp.post(`/api/user/cart/add`, cartInfo, { headers })
            .pipe(
                map((res: Response) => res.json()),
                map((res: any) => {
                    if (res.success) {
                        if (typeof window !== 'undefined') {
                            localStorage.setItem('id_cart', res.cart || 0);
                        }
                        this.navService.changeCart(res.cart || 0);
                        return true;
                    }
                    return false;
                })
            );
    }
}
