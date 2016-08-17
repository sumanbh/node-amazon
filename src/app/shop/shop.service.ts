import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';

import { Product } from './product';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class ShopService {

    constructor(private http: Http) { }

    private productUrl = '/api/products';   //URL to products Api

    getProducts (): Observable<Product[]> {
        return this.http.get(this.productUrl)
            .map((res: Response) => res.json());
    }
}