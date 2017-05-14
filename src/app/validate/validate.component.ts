import { Component, OnInit, OnDestroy } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router, ActivatedRoute } from '@angular/router';
import { tokenNotExpired } from 'angular2-jwt';
import { NavService } from '../shared/nav.service';
import { QueryParam } from './queryparam.interface';

@Component({
  selector: 'app-validate',
  template: '',
})
export class ValidateComponent implements OnInit, OnDestroy {
  param: any;
  queryParams: QueryParam;

  constructor(
    private http: Http,
    private route: ActivatedRoute,
    private router: Router,
    private navService: NavService
  ) {
  }

  ngOnInit() {
    this.param = this.route.queryParamMap.subscribe(params => {
      this.queryParams = params;
      if (this.queryParams.keys && this.queryParams.keys.length === 2) {
        try {
          const token = this.queryParams.params['token'];
          const cart = this.queryParams.params['cart'] || 0;
          this.onLogin(token, cart);
        } catch (err) {
          this.router.navigate(['/login']);
        }
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  onLogin(token, cart) {
    localStorage.setItem('token', token);
    localStorage.setItem('id_cart', cart);
    this.navService.changeNav(true);
    this.navService.changeCart(cart);
    this.router.navigate(['/']);
  }

  ngOnDestroy() {
    // prevent memory leaks
    this.param.unsubscribe();
  }
}
