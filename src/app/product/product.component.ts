import { Component, OnInit, OnDestroy, PLATFORM_ID, signal, inject } from '@angular/core';
import { isPlatformBrowser, DecimalPipe } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { NgbRatingConfig, NgbRating } from '@ng-bootstrap/ng-bootstrap';
import { NotificationsService, SimpleNotificationsModule } from 'angular2-notifications';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { ProductService } from './product.service';
import { LaptopProduct } from '../shared/types';
import { FormsModule } from '@angular/forms';

const ADDRESSES = [
  'Seattle - Washington',
  'Arches National Park - Utah',
  'Vostok Station - Antarctica',
  'Atacama Desert - Chile',
  'Taumatawhakatangi­hangakoauauotamatea­turipukakapikimaunga­horonukupokaiwhen­uakitanatahu - New Zealand',
  'Sagarmatha - Nepal',
  'Olympus Mons - Mars',
  'Death Valley - California'
];

function stringToUtfCode(str: string) {
  return str.split('').reduce((acc, _, index) => {
    acc += str.charCodeAt(index);
    return acc;
  }, 0);
}

@Component({
    selector: 'app-product',
    templateUrl: 'product.component.html',
    providers: [ProductService, NgbRatingConfig, NotificationsService],
    styleUrls: ['product.component.scss'],
    imports: [RouterLink, SimpleNotificationsModule, NgbRating, FormsModule, DecimalPipe]
})
export class ProductComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private config = inject(NgbRatingConfig);
  private toastService = inject(NotificationsService);
  private titleService = inject(Title);
  private platformId = inject(PLATFORM_ID);

  product = signal<LaptopProduct[]>([]);

  similar = signal<LaptopProduct[]>([]);

  param: Subscription;

  id: string;

  currentQuantity = 1;

  options = {
    position: ['top', 'right'],
    timeOut: 4000,
    lastOnBottom: true,
    pauseOnHover: true,
    clickToClose: true,
    maxLength: 0
  };

  shippingAddress: string;

  constructor() {
    const config = this.config;

    config.max = 5;
    config.readonly = true;
    this.id = this.route.snapshot.params.id;
    this.shippingAddress = this.getAddress();
  }

  ngOnInit() {
    // subscribe to route to get product ID
    this.param = this.route.params.subscribe(params => {
      this.id = params.id;
      this.getById(this.id);

      if (isPlatformBrowser(this.platformId)) {
        // browser scrolls to top when route param changes
        window.scrollTo(0, 0);
        this.shippingAddress = this.getAddress();
      }
    });
  }

  getAddress() {
    if (this.id) {
      return ADDRESSES[stringToUtfCode(this.id) % ADDRESSES.length];
    }
    return ADDRESSES[0];
  }

  popToast(isTrue: boolean, quantity: number) {
    if (isTrue) {
      this.toastService.success(
        `${quantity} Added`,
        `${this.product()[0].laptop_name.substring(0, 40)}...`
      );
    } else {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/product/${this.id}` }
      });
    }
  }

  popToastInvalid(header: string, subject: string) {
    this.toastService.info(header, subject, {
      timeOut: 3000
    });
  }

  getById(id: string) {
    this.productService.getProductById(id).subscribe(
      response => {
        this.currentQuantity = 1;
        this.product.set(response.product);
        this.similar.set(response.similar);
        this.titleService.setTitle(`${this.product()[0].laptop_name}`);
      },
      error => {
        if (error) this.router.navigate(['404']);
      }
    );
  }

  addToCart(id: string, qty: string | number) {
    const quantity = typeof qty === 'number' ? qty : parseInt(qty, 10) || 0;
    if (quantity <= 0) {
      this.popToastInvalid('Missing Quantity', 'Did you mean to add 1?');
    } else if (quantity > 20) {
      this.popToastInvalid('Too many added', 'Limit of 20 per customer!');
    } else {
      this.productService.addToCart(id, quantity).subscribe(
        response => {
          if (response) {
            window.scrollTo(0, 0);
            this.popToast(true, quantity);
          } else {
            this.popToastInvalid('Missing Quantity', 'Did you mean to add 1?');
          }
        },
        error => {
          window.scrollTo(0, 0);
          if (error) this.popToast(false, 0);
        }
      );
    }
  }

  ngOnDestroy() {
    // prevent memory leaks
    this.param.unsubscribe();
  }
}
