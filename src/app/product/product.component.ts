import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router'

import { Observable } from 'rxjs/Observable';

import { ProductService } from './product.service';
import { NgbRating } from '../shared/rating';

@Component({
    selector: 'product',
    templateUrl: 'product.component.html',
    providers: [ProductService],
    directives: [NgbRating],
    styleUrls: ['product.component.css']
})
export class ProductComponent implements OnInit, OnDestroy {
    _product: Array<Object>;
    _similar: Array<Object>;
    _param: any;
    _id: any;

    constructor(
        private route: ActivatedRoute,
        private productService: ProductService
    ) { }

    ngOnInit() {
        this._param = this.route.params.subscribe(params => {
            window.scrollTo(0,0);
            this._id = params['id'];
            this.getById(this._id);
        });
    }

    getById(id: any) {
        this.productService.getProductById(id)
            .subscribe(response => {
                this._product = response.product;
                this._similar = response.similar;
            })
    }

    ngOnDestroy() {
        this._param.unsubscribe();
    }

}