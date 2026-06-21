import { Injectable, inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { UserService } from './user.service';

@Injectable()
export class AuthGuard  {
  private router = inject(Router);
  private userService = inject(UserService);


  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const user = this.userService.getUser();
    if (!user && !this.userService.isLoading) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: state.url }
      });

      return false;
    }

    return true;
  }
}
