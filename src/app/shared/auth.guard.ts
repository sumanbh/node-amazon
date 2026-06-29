import { inject, Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateFn } from '@angular/router';
import { UserService } from './user.service';
import { filter, map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Observable<boolean> => {
  const router = inject(Router);
  const userService = inject(UserService);

  return userService.isLoading$.pipe(
    filter((loading) => !loading),
    take(1),
    map(() => {
      const user = userService.getUser();
      if (!user) {
        router.navigate(['/login'], {
          queryParams: { returnUrl: state.url },
        });
        return false;
      }
      return true;
    })
  );
};

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const router = inject(Router);
    const userService = inject(UserService);

    return userService.isLoading$.pipe(
      filter((loading) => !loading),
      take(1),
      map(() => {
        const user = userService.getUser();
        if (!user) {
          router.navigate(['/login'], {
            queryParams: { returnUrl: state.url },
          });
          return false;
        }
        return true;
      })
    );
  }
}
