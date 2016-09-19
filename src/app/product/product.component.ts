import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

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
        private router: Router,
        private productService: ProductService
    ) { }

    ngOnInit() {
        this._param = this.route.params.subscribe(params => {
            this._loginState = true;
            this._addedToCart = false;
            window.scrollTo(0,0);    //so that browser scrolls to top when state changes
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
                if (error) this.router.navigate(['404'])
            })
    }

    addToCart(id, quantity) :void {
        this.productService.addToCart(id, quantity)
            .subscribe(response => {
                window.scrollTo(0,0);
                this._addedToCart = true;
            },
            error => {
                window.scrollTo(0,0);
                if (error) this._loginState = false;
            })
    }
    ngOnDestroy() {
        this._param.unsubscribe();
    }
}