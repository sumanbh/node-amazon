import { Component, OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import { PaginatePipe, PaginationService, PaginationControlsCmp, IPaginationInstance } from 'ng2-pagination';

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
    private _page: number = 1;
    public _brand: string = 'Asus';
    private _total: number;


    constructor(private http: Http) {
    }

    ngOnInit() {
        this.getPage(1);
    }

    getPage(page: number) {
        this._data = this.http.get(`/api/products/${page}?brand=${this._brand}&ram=8`)
            .do((res: any) => {
                this._page = page;
                this._total = res.json().total;
            })
            .map((res: Response) => res.json().data);
    }
}