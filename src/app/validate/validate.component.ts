import { Component, OnInit } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import { NavService } from '../shared/nav.service';

@Component({
  selector: 'app-validate',
  template: '',
})
export class ValidateComponent implements OnInit {

  constructor(
    private http: Http,
    private router: Router,
    private navService: NavService
  ) {
  }

  ngOnInit() {
    this.onLogin();
  }

  onLogin(): void {
    this.http.get(`/user/status/`)
      .map((res: Response) => res.json())
      .subscribe((res) => {
        if (res.success) {
          localStorage.setItem('id_token', res.token);
          localStorage.setItem('id_cart', res.cart || 0);
          this.navService.changeNav(true);
          this.navService.changeCart(res.cart || 0);
        }
        this.router.navigate(['/']);
      }, error => {
        this.router.navigate(['/']);
      });
  }

}
