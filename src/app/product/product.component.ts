import { Component, OnInit, OnDestroy } from '@angular/core';;

import { Observable } from 'rxjs/Observable';

import { ProductService } from './product.service';

@Component({
    selector: 'product',
    templateUrl: 'product.component.html',
    providers: [ProductService],
    styleUrls: [ 'product.component.css' ]
})
export class ProductComponent implements OnInit {
    _product: Array<Object>;
    _similar: Array<Object>;

    constructor(
        private productService: ProductService
    ) { }

    ngOnInit() {
        this.getById();
     }
     getById(){
          this.productService.getProductById()
                .subscribe(response => {
                    this._product = response.product;
                    this._similar = response.similar;
                })
     }
}