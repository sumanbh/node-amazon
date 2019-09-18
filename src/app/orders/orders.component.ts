import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrdersService } from './orders.service';
import { Title } from '@angular/platform-browser';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

import { UserService } from '../shared/user.service';

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
    private userService: UserService,
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Your Orders');
    this.getOrdersInfo();
  }

  redirectToLogin() {
    this.userService.clearUser();
    this.router.navigate(['login']);
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
    this.ordersService.getOrdersById().subscribe(
      response => {
        if (response.length === 0) {
          this.noResults = true;
        }
        this.ordersContent = this.transformArr(response).reduce(
          (result, item) => {
            const [key] = Object.keys(item);
            result[key] = item[key];
            return result;
          },
          {}
        );
      },
      error => {
        if (error && error.status === 401) {
          this.redirectToLogin();
        }
      }
    );
  }
}
