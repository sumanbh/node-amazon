import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { OrdersService } from './orders.service';
import { KeysPipe } from './groupBy';

import 'underscore';

@Component({
    selector: 'orders',
    providers: [OrdersService],
    templateUrl: 'orders.component.html',
    styleUrls: ['orders.component.css'],
    pipes: [KeysPipe]
})
export class OrdersComponent implements OnInit {
    private _ordersContent: Array<Object>;

    constructor(
        private ordersService: OrdersService
    ) { }

    ngOnInit() { this.getOrdersInfo() }

    getOrdersInfo() {
        this.ordersService.getOrdersById()
            .subscribe(response => {
                this._ordersContent = _(response).groupBy(function (response) {
                    return response.id;
                })
                console.log(this._ordersContent)
            })
    }
}