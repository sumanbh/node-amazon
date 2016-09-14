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
    private _testContent: Array<Object>;

    constructor(
        private ordersService: OrdersService,
        private router: Router
    ) { }

    ngOnInit() { this.getOrdersInfo() }

    transformArr(orig) {
        var newArr = [],
            types = {},
            newItem, i, j, cur;
        for (i = 0, j = orig.length; i < j; i++) {
            cur = orig[i];
            var temp = cur.id;
            if (!(cur.id in types)) {
                types[cur.id] = { [cur.id]: [] };
                newArr.push(types[cur.id]);
            }
            types[cur.id][temp].push(cur)
        }
        return newArr;
    }

    getOrdersInfo() {
        this.ordersService.getOrdersById()
            .subscribe(response => {
                this._ordersContent = this.transformArr(response).reduce(function (result, item) {
                    var key = Object.keys(item)[0]; 
                    result[key] = item[key];
                    return result;
                }, {});;
            },
            error => {
                if (error) this.router.navigate(['user/cart'])
            })
    }
}