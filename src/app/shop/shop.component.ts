import { Component, OnInit, Input } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import { PaginatePipe, PaginationService, PaginationControlsCmp, IPaginationInstance } from 'ng2-pagination';
import 'underscore';

@Component({
    selector: 'shop',
    templateUrl: 'shop.component.html',
    providers: [PaginationService],
    directives: [PaginationControlsCmp],
    pipes: [PaginatePipe],
    styleUrls: ['shop.component.css']
})

export class ShopComponent implements OnInit {
    private _data: Observable<string[]>;
    private _itemsPerPage: number = 24;
    private _page: number = 1;
    private _total: number;
    private _brand: string= '';
    
    // public queryCollector: Array<string> = ['initial'];

    constructor(private http: Http) {
    }

    ngOnInit() {
        this.getPage(1, '');
    }

    public queryCollector = [];


    getPage(page: number, _queryParam: string) {
        if (this.queryCollector.length >= 1 && this.queryCollector.indexOf(_queryParam) !== -1) {
            this.queryCollector = _.without(this.queryCollector, _queryParam);
        }
        else if (_queryParam.length > 0 && this.queryCollector.length === 0) this.queryCollector.push(_queryParam);
        
        console.log(this.queryCollector);

        this._brand = this.queryCollector.join('');
        console.log(this._brand);


        
        this._data = this.http.get(`/api/products/${page}?brand=${this._brand}`)
            .do((res: any) => {
                this._page = page;
                this._total = res.json().total;
            })
            .map((res: Response) => res.json().data);
    }

}