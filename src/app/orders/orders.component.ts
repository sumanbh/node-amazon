import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { OrdersService } from './orders.service';

@Component({
    selector: 'app-orders',
    providers: [OrdersService],
    templateUrl: 'orders.component.html',
    styleUrls: ['orders.component.css']
})
export class OrdersComponent implements OnInit {
    ordersContent: Array<Object>;
    noResults = false;

    constructor(
        private ordersService: OrdersService,
        private router: Router
    ) { }

    ngOnInit() {
        this.getOrdersInfo();
    }

    // To group by order id. The server gives us a list of arrays. This code groups the array into smaller chunks by id.
    transformArr(orig) {
        const newArr = [];
        const types = {};
        let i;
        let j;
        let current;
        for (i = 0, j = orig.length; i < j; i += 1) {
            current = orig[i];
            const temp = current.id;
            if (!(current.id in types)) {
                types[current.id] = { [current.id]: [] };
                newArr.push(types[current.id]);
            }
            types[current.id][temp].push(current);
        }
        return newArr;
    }

    getOrdersInfo() {
        this.ordersService.getOrdersById()
            .subscribe(response => {
                if (response.length === 0) this.noResults = true;
                this.ordersContent = this.transformArr(response).reduce((result, item) => {
                    const key = Object.keys(item)[0];
                    result[key] = item[key];
                    return result;
                }, {});
            },
            error => {
                if (error) this.router.navigate(['login']);
            });
    }
}
