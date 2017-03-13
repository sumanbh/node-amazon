import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ShopService {
    constructor(
        private http: Http
    ) { }

    getAllProducts(page: number, customMin: number, customMax: number, obj: Object): Observable<any> {
        let productUrl = `/api/shop/${page}?obj=${JSON.stringify(obj)}`;  // api url
        if (customMin && customMax) {
            productUrl += `&min=${customMin}&max=${customMax}`;
        }
        return this.http.get(productUrl)
            .map((res: Response) => res.json());
    }
}
