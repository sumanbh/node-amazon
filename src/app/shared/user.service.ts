import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { JwtHelper } from 'angular2-jwt';
import { tokenNotExpired } from 'angular2-jwt';
import { Observable } from 'rxjs/Observable';
import { NavService } from '../shared/nav.service';

@Injectable()
export class UserService {
    loggedIn = false;
    jwt: string;
    jwtHelper: JwtHelper = new JwtHelper();

    constructor(
        private http: Http,
        private navService: NavService
    ) {
    }

    checkLocalStorage() {
        if (tokenNotExpired()) {
            this.loggedIn = true;
        } else {
            this.loggedIn = false;
        }
    }

    login(email, password): Observable<any> {
        const user = JSON.stringify({ email, password });
        const headers = new Headers({ Accept: 'application/json', 'Content-Type': 'application/json' });

        return this.http.post(`/login`, user, { headers: headers })
            .map((res: Response) => res.json())
            .map((res) => {
                if (res.success) {
                    localStorage.setItem('token', res.token);
                    localStorage.setItem('id_cart', res.cart || 0);
                    this.navService.changeNav(true);
                    this.navService.changeCart(res.cart);
                    return true;
                }
                return false;
            });
    }

    onLogin(): Observable<any> {
        return this.http.get(`/user/status/`)
            .map((res: Response) => res.json());
    }

    logout(): Observable<any> {
        localStorage.removeItem('token');
        localStorage.removeItem('id_cart');
        return this.http.get('/logout')
            .map((res: Response) => res.status);
    }

    isLoggedIn() {
        this.checkLocalStorage();
        if (this.loggedIn) {
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
