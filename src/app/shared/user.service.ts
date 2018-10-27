import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Http, Headers, Response } from '@angular/http';
import { JwtHelper } from 'angular2-jwt';
import { tokenNotExpired } from 'angular2-jwt';
import { Observable } from 'rxjs';
import { NavService } from '../shared/nav.service';
import { map } from 'rxjs/operators';

@Injectable()
export class UserService {
  loggedIn = false;
  jwt: string;
  jwtHelper: JwtHelper = new JwtHelper();
  baseUrl: string;

  constructor(
    private http: Http,
    private navService: NavService,
    @Inject('BASE_URL') baseUrl: string,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.baseUrl = baseUrl;
  }

  checkLocalStorage() {
    if (isPlatformBrowser(this.platformId) && tokenNotExpired()) {
      this.loggedIn = true;
    } else {
      this.loggedIn = false;
    }
  }

  login(email, password): Observable<any> {
    const user = JSON.stringify({ email, password });
    const headers = new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json'
    });

    return this.http
      .post(`${this.baseUrl}/auth/login`, user, { headers: headers })
      .pipe(
        map((res: Response) => res.json()),
        map(res => {
          if (res.success) {
            if (isPlatformBrowser(this.platformId)) {
              localStorage.setItem('token', res.token);
              localStorage.setItem('id_cart', res.cart || 0);
            }
            this.navService.changeNav(true);
            this.navService.changeCart(res.cart);
            return { success: true };
          }
          return res;
        })
      );
  }

  logout(): Observable<any> {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('id_cart');
    }
    return this.http
      .get(`${this.baseUrl}/auth/logout`)
      .pipe(map((res: Response) => res.status));
  }

  isLoggedIn() {
    this.checkLocalStorage();
    if (isPlatformBrowser(this.platformId) && this.loggedIn) {
      const cart: Number = parseInt(localStorage.getItem('id_cart'), 10) || 0;
      this.navService.changeCart(cart);
      try {
        this.jwt = localStorage.getItem('token');
        return this.jwtHelper.decodeToken(this.jwt);
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('id_cart');
        return false;
      }
    }
    return false;
  }
}
