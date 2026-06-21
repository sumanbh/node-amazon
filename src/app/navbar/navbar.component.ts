import { Component, OnInit, OnDestroy, PLATFORM_ID, Injector, signal, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { NgbDropdownConfig, NgbModal, NgbModalRef, NgbDropdown, NgbDropdownToggle, NgbDropdownMenu } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { NavService } from '../shared/nav.service';
import { UserService } from '../shared/user.service';
import { FormsModule } from '@angular/forms';
import { BASE_URL } from '../shared/base-url.token';

@Component({
    selector: 'app-nav-bar',
    templateUrl: 'navbar.component.html',
    providers: [NgbDropdownConfig],
    styleUrls: ['navbar.component.scss'],
    imports: [RouterLink, FormsModule, NgbDropdown, NgbDropdownToggle, NgbDropdownMenu]
})
export class NavbarComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);
  private navService = inject(NavService);
  private platformId = inject(PLATFORM_ID);
  private injector = inject(Injector);

  baseUrl = inject(BASE_URL);

  hideLogin = signal<boolean>(false);

  userGivenName = signal<string | null>(null);

  login = signal<boolean>(true);

  loginErr = signal<string>('Invalid email and or password.');

  cart = signal<number>(0);

  subscription: Subscription;

  cartSubscription: Subscription;

  routeSubscription: Subscription;

  loginState: boolean;

  displayLink = signal<boolean>(false);

  searchString: string;

  searchSubject = new Subject<string>();

  routeParam: Subscription;

  modalReference: NgbModalRef;

  modalService: NgbModal;

  isClient = false;

  constructor() {
    this.isClient = isPlatformBrowser(this.platformId);
    if (isPlatformBrowser(this.platformId)) {
      this.modalService = this.injector.get(NgbModal);
    }
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

  open(content: unknown) {
    this.modalReference = this.modalService.open(content);
  }

  registerSearch() {
    this.routeParam = this.route.queryParams.subscribe((params: Record<string, string | undefined>) => {
      if (params.search) {
        this.searchString = params.search;
      }
    });
  }

  searchLaptop() {
    this.searchSubject.pipe(debounceTime(300)).subscribe((search: string) => {
      const searchString = search;
      const param = searchString
        ? { search }
        : { refresh: true };
      this.router.navigate([''], {
        queryParams: param
      });
    });
  }

  submit(inputElement: HTMLElement) {
    this.searchSubject.next(this.searchString || '');
    inputElement.blur();
  }

  cartSub() {
    this.cartSubscription = this.navService.navCart$.subscribe((newValue: number) => {
      this.cart.set(newValue);
    });
  }

  newLaptopSub() {
    this.routeSubscription = this.navService.routeNew$.subscribe((newValue: boolean) => {
      this.displayLink.set(newValue);
    });
  }

  loginSub() {
    this.subscription = this.navService.navLogin$.subscribe(
      (isLoggedIn: boolean) => {
        if (isLoggedIn) {
          this.onLoginSuccess();
        } else {
          this.onLogout();
        }
      },
      (error: unknown) => console.error(error)
    );
  }

  onLoginSuccess() {
    const user = this.userService.getUser();
    if (user) {
      this.userGivenName.set(user);
      this.hideLogin.set(true);
    }
  }

  onLogout() {
    const user = this.userService.getUser();
    if (!user) {
      this.userGivenName.set(null);
      this.hideLogin.set(false);
    }
  }

  localAuth(email: string, password: string) {
    if (email && password) {
      this.userService.login(email, password).subscribe(response => {
        if (response.success) {
          if (this.modalReference) {
            this.modalReference.close();
          }
          this.login.set(true);
        } else {
          this.loginErr.set(response.err);
          this.login.set(false);
        }
      });
    } else {
      this.login.set(false);
    }
  }

  sendLogout() {
    this.userService.logout().subscribe(
      () => {
        this.userGivenName.set(null);
        this.hideLogin.set(false);
        this.router.navigate(['/']);
      },
      error => console.error(error)
    );
  }
}
