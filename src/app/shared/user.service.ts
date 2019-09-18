import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { NavService } from '../shared/nav.service';

interface User {
  name: string;
  cart: number;
}

interface LoginResponse extends User {
  success: boolean;
}

@Injectable()
export class UserService {
  loggedIn = false;
  jwt: string;
  baseUrl: string;
  user: string;
  cart: number;
  isLoading = true;

  constructor(
    private http: HttpClient,
    private navService: NavService,
    @Inject('BASE_URL') baseUrl: string,
  ) {
    this.baseUrl = baseUrl;
  }

  checkIfLoggedIn() {
    this.loggedIn = !!this.user;
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
            this.setUser(res);
            return { success: true };
          }
          return res;
        })
      );
  }

  logout(): Observable<any> {
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

  setUser(data: User) {
    this.user = data.name;
    this.cart = data.cart;
    this.navService.changeNav(true);
    this.navService.changeCart(data.cart);
  }

  makeUserRequest() {
    const apiUrl = '/api/customer';
    this.http.get<User>(this.baseUrl + apiUrl).subscribe(data => {
      if (data && data.name) {
        this.setUser(data);
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
