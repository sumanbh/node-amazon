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
    selector: 'app-shop',
    templateUrl: 'shop.component.html',
    providers: [ShopService, NgbRatingConfig],
    styleUrls: ['shop.component.scss']
})

export class ShopComponent implements OnInit {
    brand: Brand;
    os: OS;
    price: Price;
    processor: Processor;
    ram: RAM;
    hardDrive: HardDrive;
    searchResult = true;
    minCustom: number;
    maxCustom: number;
    _page = 1;
    _itemsPerPage = 24;
    _data: Array<Object>;
    _total: number;
    loading = true;

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
        this.getPage(1, '');
    }

    getPage(page: number, _queryParam: string) {
        if (_queryParam === 'customPrice') {
            this.price = {};
        } else if (this.minCustom && this.maxCustom && _queryParam === 'price') {
            this.minCustom = null;
            this.maxCustom = null;
        }
        const tempObj = Object.assign({}, this.brand, this.os, this.price, this.processor, this.ram, this.hardDrive);
        if (window.innerWidth >= 768) window.scrollTo(0, 0);
        if (_queryParam && _queryParam !== '') page = 1;

        this.shopService.getAllProducts(page, this.minCustom, this.maxCustom, tempObj)
            .subscribe(result => {
                if (result.data.length === 0) this.searchResult = false;
                else this.searchResult = true;
                this.loading = false;
                this._data = result.data;
                this._total = result.total;
                this._page = page;
            });
    }
}
