import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';

import { UserService } from './shared/user.service';

@Component({
    selector: 'app-root',
    template: `
            <app-nav-bar></app-nav-bar>
              <router-outlet>
             </router-outlet>`,
    imports: [NavbarComponent, RouterOutlet]
})
export class AppComponent implements OnInit {
  private userService = inject(UserService);


  ngOnInit(): void {
    this.userService.makeUserRequest();
  }
}
