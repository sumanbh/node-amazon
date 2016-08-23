import { Component, OnInit, Input } from '@angular/core';
import { EllipsisPipe } from './ellipsis.pipe'
import { PaginatePipe, PaginationService, PaginationControlsCmp, IPaginationInstance } from 'ng2-pagination';
import { ShopService } from './shop.service'

@Component({
    selector: 'shop',
    templateUrl: 'shop.component.html',
    providers: [PaginationService, ShopService],
    directives: [PaginationControlsCmp],
    pipes: [EllipsisPipe, PaginatePipe],
    styleUrls: ['shop.component.css']
})

export class ShopComponent implements OnInit {
    private _data: Array<Object>;
    private _itemsPerPage: number = 24;
    private _total: number;
    private _page: number = 1;
    private _loading:boolean;

    constructor(
        private shopService: ShopService
        ) { }

    ngOnInit() {
        this.getPage(1, '');
    }

    getPage(page: number, _queryParam: string) {
        this._loading = true;
        window.scrollTo(0,0);
        
        this.shopService.getAllProducts(page, _queryParam)
            .subscribe(result => {
                this._loading = false;
                this._data = result.data;
                this._total = result.total;
                this._page = page;
            })
    }
}