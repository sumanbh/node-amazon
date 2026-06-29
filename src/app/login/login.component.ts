import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { UserService } from '../shared/user.service';
import { FormsModule } from '@angular/forms';
import { BASE_URL } from '../shared/base-url.token';
import { take } from 'rxjs/operators';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    imports: [FormsModule]
})
export class LoginComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private titleService = inject(Title);
  baseUrl = inject(BASE_URL);

  login = signal<boolean>(true);

  loginErr = signal<string>('Invalid email and or password.');

  returnUrl = '';

  ngOnInit() {
    this.titleService.setTitle('Login');
    this.checkLogin();
  }

  getSafeReturnUrl(url: string | undefined): string {
    const target = url || '/';
    if (target.startsWith('/') && !target.startsWith('//') && !target.startsWith('/\\')) {
      return target;
    }
    return '/';
  }

  checkLogin() {
    const user = this.userService.getUser();
    if (user) {
      // get return url from route parameters or default to '/'
      this.returnUrl = this.getSafeReturnUrl(this.route.snapshot.queryParams.returnUrl);
      this.router.navigateByUrl(this.returnUrl);
    }
  }

  localAuth(email: string, password: string) {
    if (email && password) {
      this.userService.login(email, password).pipe(take(1)).subscribe({
        next: (response) => {
          if (response.success) {
            this.login.set(true);
            // get return url from route parameters or default to '/'
            this.returnUrl = this.getSafeReturnUrl(this.route.snapshot.queryParams.returnUrl);
            this.router.navigateByUrl(this.returnUrl);
          } else {
            this.loginErr.set(response.err || 'Invalid email and or password.');
            this.login.set(false);
          }
        },
        error: (err) => {
          console.error(err);
          this.loginErr.set('An error occurred during login.');
          this.login.set(false);
        }
      });
    } else this.login.set(false);
  }
}
