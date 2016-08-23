import { Component, OnInit, Input } from '@angular/core';
import { PaginatePipe, PaginationService, PaginationControlsCmp, IPaginationInstance } from 'ng2-pagination';
import { ShopService } from './shop.service'

@Component({
    selector: 'shop',
    templateUrl: 'shop.component.html',
    providers: [PaginationService, ShopService],
    directives: [PaginationControlsCmp],
    pipes: [PaginatePipe],
    styleUrls: ['shop.component.css']
})

export class ShopComponent implements OnInit {
    private _data: Array<Object>;
    private _itemsPerPage: number = 24;
    private _total: number;
    private _page: number = 1;

    constructor(
        private shopService: ShopService
        ) { }

    ngOnInit() {
        this.getPage(1, '');
    }

    getPage(page: number, _queryParam: string) {
        this.shopService.getAllProducts(page, _queryParam)
            .subscribe(result => {
                this._data = result.data;
                this._total = result.total;
                this._page = page;
            })
    }
}