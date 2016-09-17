import { Component, OnInit } from '@angular/core';
import { GlobalEvent } from '../shared/global.event'

import { Http, Response } from '@angular/http';

@Component({
    selector: 'nav-bar',
    templateUrl: 'navbar.component.html',
    providers: [GlobalEvent],
    styleUrls: ['navbar.component.css'],
})
export class NavbarComponent implements OnInit {
    public showLogin: boolean;
    public userGivenName: string;
    public _login:string;

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

    private onLoginSuccess() :void{
        this._login = `/login/state?location=${window.location.pathname}`;  //so that login returns back to where the user was.
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
}