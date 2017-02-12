import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from "rxjs/Observable";

@Injectable()
export class NavbarService {

    constructor(
        private http: Http
    ) { }

    onLogin(): Observable<any> {
        return this.http.get(`/user/status/`)
            .map((res: Response) => res.json())
    }

    sendLogin(email, password): Observable<any> {
        const user = JSON.stringify({ email, password });
        // console.log('User info: ', user);
        const headers = new Headers({ 'Content-Type': 'application/json' });

        return this.http.post(`/login`, user, { headers: headers })
            .map((res: Response) => res.json())
    }
}