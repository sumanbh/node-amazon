import { Component, OnInit } from '@angular/core';
import { GlobalEvent } from '../shared/global.event'

import { Http, Headers, Response } from '@angular/http';

@Component({
    selector: 'nav-bar',
    templateUrl: 'navbar.component.html',
    providers: [GlobalEvent],
    styleUrls: ['navbar.component.css'],
})
export class NavbarComponent implements OnInit {
    public showLogin: boolean;
    public userGivenName: string;
    public _login: boolean = true;

    constructor(
        private globalEvent: GlobalEvent,
        private http: Http
    ) {
        this.globalEvent.showLogin.subscribe((mode: boolean) => {
            this.showLogin = mode;
        })
    }

    ngOnInit() {
        this.onLoginSuccess();
    }

    private onLoginSuccess(): void {
        // this._login = `/login/state?location=${window.location.pathname}`;
        this.http.get(`/user/status/`)
            .map(res => res.json())
            .subscribe(
            data => {
                if (data.status) {
                    this.userGivenName = data.userName;
                    this.globalEvent.showLogin.emit(true);
                }
            }
            )
    }
    localAuth(email, password) {
        if (email && password) {
            let user = JSON.stringify({ email, password });
            // console.log('User info: ', user);
            let headers = new Headers({ 'Content-Type': 'application/json' });

            return this.http.post(`/login`, user, { headers: headers })
                .map((res: Response) => res.json())
                .subscribe(response => {
                    if (response === true) {
                        this._login = true;
                        location.reload();
                    }
                    else this._login = false;
                })
        }
        else {
            this._login = false;
        }
    }
}