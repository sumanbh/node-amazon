import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { ProductService } from './product.service';
import { NgbRatingConfig } from '@ng-bootstrap/ng-bootstrap';
import { NotificationsService } from 'angular2-notifications';

@Component({
    selector: 'app-product',
    templateUrl: 'product.component.html',
    providers: [ProductService, NgbRatingConfig, NotificationsService],
    styleUrls: ['product.component.scss']
})
export class ProductComponent implements OnInit, OnDestroy {
    product: Array<Object>;
    similar: Array<Object>;
    param: any;
    id: any;
    currentQuantity = 1;
    options = {
        position: ['top', 'right'],
        timeOut: 4000,
        lastOnBottom: true,
        pauseOnHover: true,
        clickToClose: true,
        maxLength: 0,
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private productService: ProductService,
        private config: NgbRatingConfig,
        private toastService: NotificationsService,
    ) {
        config.max = 5;
        config.readonly = true;
    }

    ngOnInit() {
        this.param = this.route.params.subscribe(params => {
            window.scrollTo(0, 0);    // browser scrolls to top when state changes
            this.id = params['id'];
            this.getById(this.id);
        });
    }

    popToast(isTrue, quantity) {
        if (isTrue) {
            this.toastService.success(
                `${quantity} Added`,
                `${this.product[0]['laptop_name'].substring(0, 40)}...`,
            );
        } else this.toastService.error(
            'Unauthorized',
            'You have to be logged in to do that!',
            {
                timeOut: 4000,
            }
        );
    }

    getById(id: any) {
        this.productService.getProductById(id)
            .subscribe(response => {
                this.currentQuantity = 1;
                this.product = response.product;
                this.similar = response.similar;
            },
            error => {
                if (error) this.router.navigate(['404']);
            });
    }

    addToCart(id, quantity) {
        this.productService.addToCart(id, quantity)
            .subscribe(response => {
                window.scrollTo(0, 0);
                this.popToast(true, quantity);
            },
            error => {
                window.scrollTo(0, 0);
                if (error) this.popToast(false, null);
            });
    }
    ngOnDestroy() {
        this.param.unsubscribe();
    }
}
