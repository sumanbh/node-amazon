import { Component, OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import { PaginatePipe, PaginationService, PaginationControlsCmp, IPaginationInstance } from 'ng2-pagination';

export interface PagedResponse<T> {
    total: number;
    data: T[];
}

export interface DataModel {
    id: number;
    data: string;
}

@Component({
    selector: 'shop',
    templateUrl: 'shop.component.html',
    providers: [PaginationService],
    directives: [PaginationControlsCmp],
    pipes: [PaginatePipe],
    styleUrls: ['shop.component.css']
})

export class ShopComponent implements OnInit {
    private data: Observable<DataModel[]>;
    private page: number = 1;

    constructor(private http: Http) {
    }

    ngOnInit() {
        this.getPage(1);
    }

    getPage(page: number) {
        this.data = this.http.get(`/api/products/${page}`)
            .do((res: any) => {
                this.page = page;
            })
            .map((res: Response) => res.json());
    }
}