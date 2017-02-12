import { Component, OnInit, Input } from '@angular/core';
import { ShopService } from './shop.service';
import { NgbRatingConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'shop',
    templateUrl: 'shop.component.html',
    providers: [ShopService, NgbRatingConfig],
    styleUrls: ['shop.component.css']
})

export class ShopComponent implements OnInit {
    _data: Array<Object>;
    _itemsPerPage: number = 24;
    _total: number;
    _loading: boolean;
    _page: number = 1;
    searchResult: boolean = true;

    constructor(
        private shopService: ShopService,
        private config: NgbRatingConfig
    ) {
        config.max = 5;
        config.readonly = true;
    }

    ngOnInit() {
        this.getPage(1, '', null, null, null, null);
    }

    getPage(page: number, _queryParam: string, min: number, max: number, customMin: number, customMax: number) {
        this._loading = true;
        if (window.innerWidth >= 768) window.scrollTo(0, 0);

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