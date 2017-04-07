import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { ProductService } from './product.service';
import { NgbRatingConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-product',
    templateUrl: 'product.component.html',
    providers: [ProductService, NgbRatingConfig],
    styleUrls: ['product.component.css']
})
export class ProductComponent implements OnInit, OnDestroy {
    _product: Array<Object>;
    _similar: Array<Object>;
    _param: any;
    _id: any;
    _currentQuantity = 1;

    _addedToCart = false;
    _loginState = true;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private productService: ProductService,
        private config: NgbRatingConfig
    ) {
        config.max = 5;
        config.readonly = true;
    }

    ngOnInit() {
        this._param = this.route.params.subscribe(params => {
            this._loginState = true;
            this._addedToCart = false;
            window.scrollTo(0, 0);    // browser scrolls to top when state changes
            this._id = params['id'];
            this.getById(this._id);
        });
    }

    getById(id: any) {
        this.productService.getProductById(id)
            .subscribe(response => {
                this._currentQuantity = 1;
                this._product = response.product;
                this._similar = response.similar;
            },
            error => {
                if (error) this.router.navigate(['404']);
            });
    }

    addToCart(id, quantity) {
        this.productService.addToCart(id, quantity)
            .subscribe(response => {
                window.scrollTo(0, 0);
                this._addedToCart = true;
            },
            error => {
                window.scrollTo(0, 0);
                if (error) this._loginState = false;
            });
    }
    ngOnDestroy() {
        this._param.unsubscribe();
    }
}
