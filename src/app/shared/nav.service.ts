import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class NavService {
  // Observable sources
  private navLoginSource = new BehaviorSubject<boolean>(false);

  private navCartSource = new BehaviorSubject<number>(0);

  private routeNewLaptop = new BehaviorSubject<boolean>(false);

  // Observable streams
  navLogin$ = this.navLoginSource.asObservable();

  navCart$ = this.navCartSource.asObservable();

  routeNew$ = this.routeNewLaptop.asObservable();

  // service commands
  changeNav(isTrue: boolean): void {
    this.navLoginSource.next(isTrue);
  }

  changeCart(value: number): void {
    this.navCartSource.next(value);
  }

  newRoute(isTrue: boolean): void {
    this.routeNewLaptop.next(isTrue);
  }
}
