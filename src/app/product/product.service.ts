import { Injectable }     from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable }     from 'rxjs/Observable';
import { Product } from './product';
import { Router, ActivatedRoute }       from '@angular/router';


@Injectable()
export class ProductService {
    private urlParam: string = this.route.snapshot.params['id'];
    private productUrl = `api/product/${this.urlParam}`;

    constructor(
        private route: ActivatedRoute,
        private http: Http
    ) { }

    getProductById(): Observable<Object[]> {
        return this.http.get(this.productUrl)
            .map((res: Response) => res.json());
    }
}

