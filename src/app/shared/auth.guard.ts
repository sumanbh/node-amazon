import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { tokenNotExpired } from 'angular2-jwt';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (tokenNotExpired()) {
            return true;
        }

        // Not logged in
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
        return false;
    }
}
