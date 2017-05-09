import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../shared/user.service';
import { Subscription } from 'rxjs/Subscription';
import { NavService } from '../shared/nav.service';

@Component({
    selector: 'app-nav-bar',
    templateUrl: 'navbar.component.html',
    providers: [],
    styleUrls: ['navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
    hideLogin: boolean;
    userGivenName: string;
    login = true;
    cart = 0;
    subscription: Subscription;
    cartSubscription: Subscription;
    loginState: boolean;

    constructor(
        private userService: UserService,
        private navService: NavService
    ) {
    }

    ngOnInit() {
        this.loginSub();
        this.onLoginSuccess();
        this.cartSub();
    }

    ngOnDestroy() {
        // prevent memory leak when component is destroyed
        this.subscription.unsubscribe();
        this.cartSubscription.unsubscribe();
    }

    cartSub() {
        this.cartSubscription = this.navService.navCart$
            .subscribe(newValue => {
                this.cart = newValue;
            });
    }

    loginSub() {
        this.subscription = this.navService.navLogin$
            .subscribe(isTrue => {
                this.loginState = isTrue;
                if (this.loginState) {
                    this.onLoginSuccess();
                }
            }, error => console.log(error));
    }

    onLoginSuccess() {
        const state = this.userService.isLoggedIn();
        if (state) {
            this.subscription.unsubscribe();
            this.userGivenName = state.name;
            this.hideLogin = true;
        }
    }

    localAuth(email, password) {
        if (email && password) {
            this.userService.login(email, password)
                .subscribe(response => {
                    if (response) {
                        this.login = true;
                        location.reload();
                    } else this.login = false;
                });
        } else this.login = false;
    }

    sendLogout() {
        this.userService.logout()
            .subscribe(response => {
                this.hideLogin = false;
                location.reload();
            }, error => console.log(error));
    }
}
