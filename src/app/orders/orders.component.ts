import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { OrdersService } from './orders.service';
import { GroupByPipe } from './groupby.pipe';

import 'underscore';

@Component({
    selector: 'orders',
    providers: [OrdersService],
    templateUrl: 'orders.component.html',
    styleUrls: ['orders.component.css'],
    pipes: [GroupByPipe]
})
export class OrdersComponent implements OnInit {
    private _ordersContent: Array<Object>;

    constructor(
        private ordersService: OrdersService,
        private router: Router
    ) { }

    ngOnInit() { this.getOrdersInfo() }

    getOrdersInfo() {
        this.ordersService.getOrdersById()
            .subscribe(response => {
                this._ordersContent = _(response).groupBy(function (response) {
                    return response.id;
                })
            },
            error => {
                if (error) this.router.navigate(['user/cart'])
            })
    }
}