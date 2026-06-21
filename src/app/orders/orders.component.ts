import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { NgbDropdownConfig, NgbDropdown, NgbDropdownToggle, NgbDropdownMenu } from '@ng-bootstrap/ng-bootstrap';
import { OrdersService } from './orders.service';

import { UserService } from '../shared/user.service';
import { OrderItem } from '../shared/types';
import { DatePipe } from '@angular/common';
import { GroupByPipe } from './groupby.pipe';

@Component({
    selector: 'app-orders',
    providers: [OrdersService, NgbDropdownConfig],
    templateUrl: 'orders.component.html',
    styleUrls: ['orders.component.scss'],
    imports: [RouterLink, NgbDropdown, NgbDropdownToggle, NgbDropdownMenu, DatePipe, GroupByPipe]
})
export class OrdersComponent implements OnInit {
  private ordersService = inject(OrdersService);
  private router = inject(Router);
  private titleService = inject(Title);
  private userService = inject(UserService);

  ordersContent = signal<Record<string, OrderItem[]>>({});

  noResults = false;

  ngOnInit() {
    this.titleService.setTitle('Your Orders');
    this.getOrdersInfo();
  }

  redirectToLogin() {
    this.userService.clearUser();
    this.router.navigate(['login']);
  }

  // To group by order id. The server gives us a list of arrays. This code groups the array into smaller chunks by id.
  transformArr(original: OrderItem[]): Record<string, OrderItem[]>[] {
    const results: Record<string, OrderItem[]>[] = [];
    const types: Record<string, Record<string, OrderItem[]>> = {};
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
        this.ordersContent.set(
          this.transformArr(response).reduce(
            (result, item) => {
              const [key] = Object.keys(item);
              result[key] = item[key];
              return result;
            },
            {} as Record<string, OrderItem[]>
          )
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
