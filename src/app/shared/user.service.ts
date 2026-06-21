import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { NavService } from '../shared/nav.service';
import { BASE_URL } from './base-url.token';

interface User {
  name: string;
  cart: number;
}

interface LoginResponse extends User {
  success: boolean;
  err?: string;
}

@Injectable()
export class UserService {
  private http = inject(HttpClient);
  private navService = inject(NavService);

  loggedIn = false;

  jwt: string;

  baseUrl: string;

  user: string;

  cart: number;

  isLoading = true;

  constructor() {
    const baseUrl = inject(BASE_URL);

    this.baseUrl = baseUrl;
  }

  checkIfLoggedIn() {
    this.loggedIn = !!this.user;
  }

  login(email: string, password: string): Observable<LoginResponse> {
    const user = JSON.stringify({ email, password });
    const headers = new HttpHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json'
    });

    return this.http
      .post<LoginResponse>(`${this.baseUrl}/auth/login`, user, {
        headers
      })
      .pipe(
        map(res => {
          if (res.success) {
            this.setUser(res.name);
            this.setCart(res.cart);
            return { success: true, name: res.name, cart: res.cart };
          }
          return res;
        })
      );
  }

  logout(): Observable<string> {
    this.clearUser();
    return this.http.get(`${this.baseUrl}/auth/logout`, {
      responseType: 'text'
    });
  }

  getUser() {
    this.checkIfLoggedIn();
    if (this.loggedIn) {
      return this.user;
    }
    return '';
  }

  setCart(cart: number) {
    this.cart = cart;
    this.navService.changeNav(true);
    this.navService.changeCart(this.cart);
  }

  setUser(user: string) {
    this.user = user;
    this.navService.changeNav(true);
  }

  makeUserRequest() {
    const apiUrl = '/api/customer';
    this.http.get<User>(this.baseUrl + apiUrl).subscribe(data => {
      if (data && data.name) {
        this.setUser(data.name);
        this.setCart(data.cart);
        this.isLoading = false;
      }
    });
  }

  clearUser() {
    this.user = null;
    this.cart = null;
    this.navService.changeNav(false);
  }
}
