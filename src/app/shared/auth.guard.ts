import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { JwtHelperService } from 'angular-jwt-universal';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private jwtHelperService: JwtHelperService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (isPlatformBrowser(this.platformId)) {
      const token: string = this.jwtHelperService.tokenGetter();

      if (!token) {
        this.router.navigate(['/login'], {
          queryParams: { returnUrl: state.url }
        });

        return false;
      }

      const tokenExpired: boolean = this.jwtHelperService.isTokenExpired(token);

      if (tokenExpired) {
        this.router.navigate(['/login'], {
          queryParams: { returnUrl: state.url }
        });
        return false;
      }

      return true;
    }

    return false;
  }
}
