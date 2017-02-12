import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from "rxjs/Observable";

@Injectable()
export class ProfileService {

    constructor(
        private http: Http
    ) { }

    getUserProfile(): Observable<any> {
        return this.http.get(`/api/user/settings`)
            .map((res: Response) => res.json())
    }

    updateUserProfile(givenName, fullName, address, city, state, zip): Observable<any> {
        const userInfo = JSON.stringify({ givenName, fullName, address, city, state, zip });
        const headers = new Headers({ 'Content-Type': 'application/json' });

        return this.http.post(`/api/user/update`, userInfo, { headers: headers })
            .map((res: Response) => res.status)
    }
}