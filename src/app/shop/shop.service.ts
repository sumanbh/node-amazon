import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ShopService {
    constructor(
        private http: Http
    ) { }

    getAllProducts(page: number, minCustom: number, maxCustom: number, obj: Object): Observable<any> {
        let productUrl = `/api/shop/${page}?obj=${JSON.stringify(obj)}`;  // api url
        if (minCustom && maxCustom) {
            productUrl += `&min=${minCustom}&max=${maxCustom}`;
        }
        return this.http.get(productUrl)
            .map((res: Response) => res.json());
    }
}
