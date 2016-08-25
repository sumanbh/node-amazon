import { Injectable }     from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable }     from 'rxjs/Observable';

@Injectable()
export class ProductService {

    constructor(
        private http: Http
    ) { }

    getProductById(id: string): Observable<Object[]> {
        const productUrl = `api/product/${id}`;  //api url
        return this.http.get(productUrl)
            .map((res: Response) => res.json());
    }
