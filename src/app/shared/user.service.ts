import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { JwtHelperService } from 'angular-jwt-universal';
import { Observable } from 'rxjs';
import { NavService } from '../shared/nav.service';
import { map } from 'rxjs/operators';

interface LoginResponse {
  success?: boolean;
  token?: string;
  cart?: number;
}

@Injectable()
export class UserService {
  loggedIn = false;
  jwt: string;
  baseUrl: string;

  constructor(
    private http: HttpClient,
    private navService: NavService,
    private jwtHelperService: JwtHelperService,
    @Inject('BASE_URL') baseUrl: string,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.baseUrl = baseUrl;
  }

  checkLocalStorage() {
    if (isPlatformBrowser(this.platformId)) {
      const token: string = this.jwtHelperService.tokenGetter();

      if (!token) {
        this.loggedIn = false;
      } else {
        const tokenExpired: boolean = this.jwtHelperService.isTokenExpired(
          token
        );
        if (!tokenExpired) {
          this.loggedIn = true;
        } else {
          this.loggedIn = false;
        }
      }
    } else {
      this.loggedIn = false;
    }
  }

  login(email, password): Observable<any> {
    const user = JSON.stringify({ email, password });
    const headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json'
    });

    return this.http
      .post<LoginResponse>(`${this.baseUrl}/auth/login`, user, {
        headers: headers
      })
      .pipe(
        map(res => {
          if (res.success) {
            if (isPlatformBrowser(this.platformId)) {
              localStorage.setItem('token', res.token);
              localStorage.setItem(
                'id_cart',
                res.cart ? String(res.cart) : '0'
              );
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
    return this.http.get(`${this.baseUrl}/auth/logout`, {
      responseType: 'text'
    });
  }

  isLoggedIn() {
    this.checkLocalStorage();
    if (isPlatformBrowser(this.platformId) && this.loggedIn) {
      const cart: Number = parseInt(localStorage.getItem('id_cart'), 10) || 0;
      this.navService.changeCart(cart);
      try {
        this.jwt = localStorage.getItem('token');
        return this.jwtHelperService.decodeToken(this.jwt);
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('id_cart');
        return false;
      }
    }
    return false;
  }
}
