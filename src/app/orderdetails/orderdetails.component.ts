import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { OrderDetailsService } from './orderdetails.service';
@Component({
    selector: 'order-details',
    templateUrl: 'orderdetails.component.html',
    providers: [OrderDetailsService],
    styleUrls: ['orderdetails.component.css']
})
export class OrderDetailsComponent implements OnInit {
    constructor() { }

    ngOnInit() { }
}