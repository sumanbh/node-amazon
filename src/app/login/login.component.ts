import { Component, OnInit } from '@angular/core';
import { UserService } from '../shared/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  _login = true;

  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit() {
    this.checkLogin();
  }

  checkLogin() {
    const state = this.userService.isLoggedIn();
    if (state) this.router.navigate(['/']);
  }

  localAuth(email, password) {
    if (email && password) {
      this.userService.login(email, password)
        .subscribe(response => {
          if (response) {
            this._login = true;
            this.router.navigate(['/']);
          } else this._login = false;
        });
    } else this._login = false;
  }
}
