import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { OrdersService } from './orders.service';

@Component({
    selector: 'orders',
    providers: [OrdersService],
    templateUrl: 'orders.component.html',
    styleUrls: ['orders.component.css']
})
export class OrdersComponent implements OnInit {
    private _ordersContent: Array<Object>;

    constructor(
        private ordersService: OrdersService
    ) { }

    ngOnInit() { this.getOrdersInfo() }

    getOrdersInfo() {
        this.ordersService.getOrdersById()
            .subscribe( response => {
                this._ordersContent = response.data;
            })
    }
}