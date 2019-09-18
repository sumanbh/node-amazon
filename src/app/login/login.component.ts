import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  login = true;
  loginErr = 'Invalid email and or password.';
  returnUrl: string;

  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private titleService: Title
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Login');
    this.checkLogin();
  }

  checkLogin() {
    const user = this.userService.getUser();
    if (user) {
      // get return url from route parameters or default to '/'
      this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
      this.router.navigateByUrl(this.returnUrl);
    }
  }

  localAuth(email, password) {
    if (email && password) {
      this.userService.login(email, password).subscribe(response => {
        if (response.success) {
          this.login = true;
          // get return url from route parameters or default to '/'
          this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigateByUrl(this.returnUrl);
        } else {
          this.loginErr = response.err;
          this.login = false;
        }
      });
    } else this.login = false;
  }
}
