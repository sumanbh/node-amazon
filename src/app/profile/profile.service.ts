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

    updateUserProfile(given_name, fullname, address, city, state, zip): Observable<any> {
        let userInfo = JSON.stringify({given_name, fullname, address, city, state, zip});
        let headers = new Headers({ 'Content-Type': 'application/json' });

        return this.http.post(`/api/user/update`, userInfo, {headers: headers})
            .map((res: Response) => res.status)
    }
}