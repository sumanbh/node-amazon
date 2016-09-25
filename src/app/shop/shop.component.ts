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
    private _page: number = 1;
    public searchResult: boolean = true;

    constructor(
        private shopService: ShopService
        ) { }

    ngOnInit() {
        this.getPage(1, '', null, null, null, null);
    }

    getPage(page: number, _queryParam: string, min: number, max: number, customMin:number, customMax: number) {
        this._loading = true;
        if(window.innerWidth >= 768) window.scrollTo(0,0);

        this.shopService.getAllProducts(page, _queryParam, min, max, customMin, customMax)
            .subscribe(result => {
                if (result.data.length === 0) this.searchResult = false;
                else this.searchResult = true;
                this._loading = false;
                this._data = result.data;
                this._total = result.total;
                this._page = page;
            })
    }
}