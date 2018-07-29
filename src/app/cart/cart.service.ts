import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Response } from '@angular/http';
import { Observable } from 'rxjs';
import { AuthHttp } from 'angular2-jwt';
import { NavService } from '../shared/nav.service';
import { map } from 'rxjs/operators';

@Injectable()
export class CartService {
    constructor(
        public authHttp: AuthHttp,
        private navService: NavService,
        @Inject(PLATFORM_ID) private platformId: Object,
    ) { }

    getCartById(): Observable<any> {
        const productUrl = `/api/user/cart`;  // api url
        return this.authHttp.get(productUrl)
            .pipe(
                map((res: Response) => res.json()),
                map((res: any) => {
                    if (isPlatformBrowser(this.platformId)) {
                        localStorage.setItem('id_cart', res.cart || 0);
                    }
                    this.navService.changeCart(res.cart || 0);
                    return res;
                })
            );
    }

    removeFromCart(id): Observable<any> {
        const productUrl = `/api/user/cart/remove/${id}`;
        return this.authHttp.delete(productUrl)
            .pipe(
                map((res: Response) => res.json()),
                map((res: any) => {
                    if (res.success) {
                        const cart = res.cart || 0;
                        if (isPlatformBrowser(this.platformId)) {
                            localStorage.setItem('id_cart', cart);
                        }
                        this.navService.changeCart(cart);
                        return true;
                    }
                    return false;
                })
            );
    }
}
