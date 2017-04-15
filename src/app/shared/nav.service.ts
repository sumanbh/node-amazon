import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class NavService {
  // Observable source
  private navLoginSource = new BehaviorSubject<boolean>(false);
  private navCartSource = new BehaviorSubject<number>(0);
  // Observable stream
  navLogin$ = this.navLoginSource.asObservable();
  navCart$ = this.navCartSource.asObservable();
  // service command
  changeNav(isTrue) {
    this.navLoginSource.next(isTrue);
  }
  changeCart(value) {
    this.navCartSource.next(value);
  }
}
