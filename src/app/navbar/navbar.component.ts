import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { GlobalEvent } from '../shared/GlobalEvent'

import { Http, Response } from '@angular/http';
import { Observable }     from 'rxjs/Observable';

@Component({
    selector: 'navbar',
    templateUrl: 'navbar.component.html',
    providers: [GlobalEvent],
    styleUrls: ['navbar.component.css'],
})
export class NavbarComponent implements OnInit {
    public showLogin: boolean;
    constructor(
        private globalEvent: GlobalEvent
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
        this.http.get('/user/status')
            .map(res => res.json())
            .subscribe(
                data => {
                    if (data.status) this.globalEvent.showLogin.emit(true);
                };
            )
    }
}