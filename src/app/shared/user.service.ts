import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, take } from 'rxjs/operators';

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
  baseUrl = inject(BASE_URL);

  loggedIn = false;

  jwt?: string;

  user: string | null = null;

  cart: number | null = null;

  isLoading$ = new BehaviorSubject<boolean>(true);

  get isLoading() {
    return this.isLoading$.value;
  }

  set isLoading(val: boolean) {
    this.isLoading$.next(val);
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
    this.http.get<User>(this.baseUrl + apiUrl).pipe(take(1)).subscribe({
      next: (data) => {
        if (data && data.name) {
          this.setUser(data.name);
          this.setCart(data.cart);
        }
        this.isLoading = false;
      },
      error: () => {
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
