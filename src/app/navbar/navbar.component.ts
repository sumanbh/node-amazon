import { Component, OnInit } from '@angular/core';
import { GlobalEvent } from '../shared/global.event'

import { Http, Response } from '@angular/http';

@Component({
    selector: 'nav-bar',
    template: `<nav class="navbar navbar-default">
  <div class="container-fluid">
    <div class="navbar-header">
      <a class="navbar-brand" [routerLink]="['']">Cyrano</a>
      <a class="nav-shop" [routerLink]="['/shop']">Shop</a>

      <a *ngIf="!showLogin" (click)="onLoginSuccess()" class="login-google" [href]="_login"><img src="assets/images/signin.png" alt="Sign in" class="hidden-xs"><img src="assets/images/btn_google_mobile.png"
          alt="Sign in" class="visible-xs"></a>

      <a *ngIf="showLogin" class="dropdown user-welcome">
        <a class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Hello, {{userGivenName}}<span class="caret"></span></a>
        <ul class="dropdown-menu">
          <li><a class="drop-link" [routerLink]="['/user/orders']">Your Orders</a></li>
          <li role="separator" class="divider"></li>
          <li><a class="drop-link" href="/logout">Sign Out</a></li>
        </ul>
        &nbsp;
        <a class="cart-icon" [routerLink]="['/user/cart']"><span class = "glyphicon glyphicon-shopping-cart"></span> Cart</a>

      </a>
    </div>
  </div>
</nav>`,
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