import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router'

import { Observable } from 'rxjs/Observable';
import { ProductService } from './product.service';

@Component({
    selector: 'product',
    templateUrl: 'product.component.html',
    providers: [ProductService],
    styleUrls: ['product.component.css']
})
export class ProductComponent implements OnInit, OnDestroy {
    private _product: Array<Object>;
    private _similar: Array<Object>;
    private _param: any;
    private _id: any;
    private _currentQuantity: number = 1;

    private _addedToCart: boolean = false;
    private _loginState: boolean = true;

    constructor(
        private route: ActivatedRoute,
        private productService: ProductService
    ) { }

    ngOnInit() {
        this._param = this.route.params.subscribe(params => {
            this._loginState = true;
            this._addedToCart = false;
            window.scrollTo(0,0);
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
            })
    }

    addToCart(id, quantity) :void {
        this.productService.addToCart(id, quantity)
            .subscribe(response => {
                window.scrollTo(0,0);
                this._loginState = response.userLog;
                if (this._loginState) this._addedToCart = true;
            })
    }

    ngOnDestroy() {
        this._param.unsubscribe();
    }

}