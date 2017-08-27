import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class NavService {
    // Observable source
    private navLoginSource = new BehaviorSubject<boolean>(false);
    private navCartSource = new BehaviorSubject<number>(0);
    private routeNewLaptop = new BehaviorSubject<boolean>(false);
    // Observable stream
    navLogin$ = this.navLoginSource.asObservable();
    navCart$ = this.navCartSource.asObservable();
    routeNew$ = this.routeNewLaptop.asObservable();
    // service command
    changeNav(isTrue) {
        this.navLoginSource.next(isTrue);
    }
    changeCart(value) {
        this.navCartSource.next(value);
    }
    newRoute(isTrue) {
        this.routeNewLaptop.next(isTrue);
    }
}
