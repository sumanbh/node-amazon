import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from './navbar/navbar.component'

@Component({
  selector: 'app-root',
  template: `<navbar></navbar>
            <router-outlet></router-outlet>`,
  directives: [NavbarComponent]
})

export class AppComponent  {

}