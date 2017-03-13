import { Component, OnInit, Input } from '@angular/core';
import { ShopService } from './shop.service';
import { NgbRatingConfig } from '@ng-bootstrap/ng-bootstrap';

import { Brand } from './interfaces/brands.interface';
import { OS } from './interfaces/os.interface';
import { Price } from './interfaces/price.interface';
import { Processor } from './interfaces/processor.interface';
import { RAM } from './interfaces/ram.interface';
import { HardDrive } from './interfaces/harddrive.interface';

@Component({
    selector: 'shop',
    templateUrl: 'shop.component.html',
    providers: [ShopService, NgbRatingConfig],
    styleUrls: ['shop.component.css']
})

export class ShopComponent implements OnInit {
    brand: Brand;
    os: OS;
    price: Price;
    processor: Processor;
    ram: RAM;
    hardDrive: HardDrive;
    searchResult = true;
    _page = 1;
    _itemsPerPage = 24;
    _data: Array<Object>;
    _total: number;
    _loading: boolean;

    constructor(
        private shopService: ShopService,
        private config: NgbRatingConfig
    ) {
        config.max = 5;
        config.readonly = true;
    }

    ngOnInit() {
        this.brand = {};
        this.os = {};
        this.price = {};
        this.processor = {};
        this.ram = {};
        this.hardDrive = {};
        this.getPage(1, '', null, null);
    }

    getPage(page: number, _queryParam: string, customMin: number, customMax: number) {
        this._loading = true;
        if (customMin && customMax) {
            Object.keys(this.price).forEach((value) => {
                this.price[value] = false;
            });
        }
        const tempObj = Object.assign({}, this.brand, this.os, this.price, this.processor, this.ram, this.hardDrive);
        if (window.innerWidth >= 768) window.scrollTo(0, 0);
        if (_queryParam && _queryParam !== '') page = 1;

        this.shopService.getAllProducts(page, customMin, customMax, tempObj)
            .subscribe(result => {
                if (result.data.length === 0) this.searchResult = false;
                else this.searchResult = true;
                this._loading = false;
                this._data = result.data;
                this._total = result.total;
                this._page = page;
            });
    }
}
