import { Component, OnInit } from '@angular/core';

import { UserService } from './shared/user.service';

@Component({
  selector: 'app-root',
  template: `
            <app-nav-bar></app-nav-bar>
             <router-outlet>
            </router-outlet>`
})
export class AppComponent implements OnInit {
  constructor(
    private userService: UserService,
  ) {}

  ngOnInit() {
    this.userService.makeUserRequest();
  }
}
