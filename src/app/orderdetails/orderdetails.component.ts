import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { OrderDetailsService } from './orderdetails.service';
@Component({
    selector: 'order-details',
    templateUrl: 'orderdetails.component.html',
    providers: [OrderDetailsService],
    styleUrls: ['orderdetails.component.css']
})
export class OrderDetailsComponent implements OnInit {
    private _param: any;
    private _orderInfo: any;
    private _temp: any;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private orderDetailsService: OrderDetailsService
    ) {
        
    }   

    ngOnInit() {
        this._param = this.route.snapshot.params['id'];
        // console.log(this._param);
        this.getOrder(this._param)
     }

    getOrder(order: number) {
        this.orderDetailsService.getOrdersById(order)
            .subscribe(response => {
                // console.log(response)
                this._temp = response.one;
                this._orderInfo = response.data;
            },
            error => {
                if (error) this.router.navigate['/user/cart']
            })
    }
}