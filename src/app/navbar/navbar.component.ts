import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../shared/user.service';
import { Subscription } from 'rxjs/Subscription';
import { NavService } from '../shared/nav.service';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';

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
    loginErr = 'Invalid email and or password.';
    cart = 0;
    subscription: Subscription;
    cartSubscription: Subscription;
    routeSubscription: Subscription;
    loginState: boolean;
    displayLink: boolean;
    searchString: string;
    searchSubject: Subject<string> = new Subject();
    routeParam: any;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private userService: UserService,
        private navService: NavService,
    ) {
    }

    ngOnInit() {
        this.loginSub();
        this.onLoginSuccess();
        this.cartSub();
        this.newLaptopSub();
        this.searchLaptop();
        this.registerSearch();
    }

    ngOnDestroy() {
        // prevent memory leak when component is destroyed
        this.subscription.unsubscribe();
        this.cartSubscription.unsubscribe();
        this.routeSubscription.unsubscribe();
        this.searchSubject.unsubscribe();
        this.routeParam.unsubscribe();
    }

    registerSearch() {
        this.routeParam = this.route.queryParams.subscribe((params) => {
            if (params.search) {
                this.searchString = params.search;
            }
        });
    }

    searchLaptop() {
        this.searchSubject.debounceTime(300).subscribe(search => {
            const searchString = search;
            let param = {};
            if (searchString) {
                param = {
                    search,
                }
            } else {
                param = {
                    refresh: true,
                }
            }
            this.router.navigate([''], {
                queryParams: param
            });
        });
    }

    submit() {
        this.searchSubject.next(this.searchString || '');
    }

    cartSub() {
        this.cartSubscription = this.navService.navCart$
            .subscribe(newValue => {
                this.cart = newValue;
            });
    }

    newLaptopSub() {
        this.routeSubscription = this.navService.routeNew$
            .subscribe(newValue => {
                this.displayLink = newValue;
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
                    if (response.success) {
                        this.login = true;
                        location.reload();
                    } else {
                        this.loginErr = response.err;
                        this.login = false;
                    }
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
