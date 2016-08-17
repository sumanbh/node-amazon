import { Component, OnInit } from '@angular/core';
import { Product } from './product';
import { ShopService } from './shop.service';
import {PaginationControlsCmp, PaginatePipe, PaginationService} from 'ng2-pagination';


@Component({
    selector: 'shop',
    templateUrl: 'shop.component.html',
    providers: [ShopService, PaginationService],
    directives: [PaginationControlsCmp],
    pipes: [PaginatePipe],
    styleUrls: ['shop.component.css']
})
export class ShopComponent implements OnInit {
    products: Product[];

    constructor( private shopService: ShopService ) { }

    ngOnInit() { this.getProducts(); }

    getProducts(){
        this.shopService.getProducts()
            .subscribe(
                products => this.products = products
            )
    }

}