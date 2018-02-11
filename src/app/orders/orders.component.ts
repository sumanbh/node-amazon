import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { OrdersService } from './orders.service';
import { Title } from '@angular/platform-browser';
import { SlimLoadingBarService } from 'ng2-slim-loading-bar';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-orders',
    providers: [OrdersService, NgbDropdownConfig],
    templateUrl: 'orders.component.html',
    styleUrls: ['orders.component.scss']
})
export class OrdersComponent implements OnInit {
    ordersContent: Array<Object>;
    noResults = false;

    constructor(
        private ordersService: OrdersService,
        private router: Router,
        private titleService: Title,
        private slimLoadingBarService: SlimLoadingBarService,
    ) { }

    ngOnInit() {
        this.titleService.setTitle('Your Orders');
        this.getOrdersInfo();
    }

    // To group by order id. The server gives us a list of arrays. This code groups the array into smaller chunks by id.
    transformArr(original) {
        const results = [];
        const types = {};
        let i;
        let j;
        let current;
        for (i = 0, j = original.length; i < j; i += 1) {
            current = original[i];
            const tempId = current.id;
            if (!(current.id in types)) {
                types[current.id] = { [current.id]: [] };
                results.push(types[current.id]);
            }
            types[current.id][tempId].push(current);
        }
        return results;
    }

    getOrdersInfo() {
        // start the loading bar animation
        this.slimLoadingBarService.start();

        this.ordersService.getOrdersById()
            .subscribe(response => {
                this.slimLoadingBarService.complete();
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
