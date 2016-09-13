import { Component } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
            <div class="nav-container"><nav-bar></nav-bar></div>
             <router-outlet>
            </router-outlet>`,
  directives: [ROUTER_DIRECTIVES],
  styles:['nav-container{ min-height: 40px; }']
})

export class AppComponent  {

}