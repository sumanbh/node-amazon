import { Component, OnInit } from '@angular/core';
import { GlobalEvent } from '../shared/global.event';

import { Http, Headers, Response } from '@angular/http';
import { NavbarService } from './navbar.service';


@Component({
    selector: 'app-nav-bar',
    templateUrl: 'navbar.component.html',
    providers: [GlobalEvent, NavbarService],
    styleUrls: ['navbar.component.css'],
})
export class NavbarComponent implements OnInit {
    showLogin: boolean;
    userGivenName: string;
    _login = true;

    constructor(
        private globalEvent: GlobalEvent,
        private http: Http,
        private navbarService: NavbarService
    ) {
        this.globalEvent.showLogin.subscribe((mode: boolean) => {
            this.showLogin = mode;
        });
    }

    ngOnInit() {
        this.onLoginSuccess();
    }

    onLoginSuccess() {
        // this._login = `/login/state?location=${window.location.pathname}`;
        this.navbarService.onLogin()
            .subscribe( data => {
                if (data.status) {
                    this.userGivenName = data.userName;
                    this.globalEvent.showLogin.emit(true);
                }
            });
    }
    localAuth(email, password) {
        if (email && password) {
            this.navbarService.sendLogin(email, password)
                .subscribe(response => {
                    if (response === true) {
                        this._login = true;
                        location.reload();
                    } else this._login = false;
                });
        } else this._login = false;
    }
}
