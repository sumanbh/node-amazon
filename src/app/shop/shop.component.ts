import { Component, OnInit, Input } from '@angular/core';
import { ShopService } from './shop.service';

@Component({
    selector: 'shop',
    templateUrl: 'shop.component.html',
    providers: [ShopService],
    styleUrls: ['shop.component.css']
})

export class ShopComponent implements OnInit {
    private _data: Array<Object>;
    private _itemsPerPage: number = 24;
    private _total: number;
    private _loading:boolean;
    public _page: number = 1;
    public rate:number;
    public readonly:boolean;
    public max:number = 5;

    constructor(
        private shopService: ShopService
        ) { }

    ngOnInit() {
        this.getPage(1, '');
    }

    getPage(page: number, _queryParam: string) {
        this._loading = true;
        if(window.innerWidth >= 768) window.scrollTo(0,0);

        this.shopService.getAllProducts(page, _queryParam)
            .subscribe(result => {
                this._loading = false;
                this._data = result.data;
                this._total = result.total;
                this._page = page;
            })
    }
}