import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgbRatingConfig, NgbRating } from '@ng-bootstrap/ng-bootstrap';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { HomeService } from './home.service';

import { NavService } from '../shared/nav.service';
import { Brand } from './interfaces/brands.interface';
import { OS } from './interfaces/os.interface';
// import { Price } from './interfaces/price.interface';
import { Processor } from './interfaces/processor.interface';
import { RAM } from './interfaces/ram.interface';
import { Storage } from './interfaces/storage.interface';
import { QueryParam } from './interfaces/queryparam.interface';
import { ProductSummary } from '../shared/types';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { EllipsisPipe } from './ellipsis.pipe';
import { BASE_URL } from '../shared/base-url.token';

@Component({
    selector: 'app-home',
    templateUrl: 'home.component.html',
    providers: [HomeService, NgbRatingConfig],
    styleUrls: ['home.component.scss'],
    imports: [RouterLink, FormsModule, NgbRating, NgxPaginationModule, EllipsisPipe]
})
export class HomeComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private homeService = inject(HomeService);
  private config = inject(NgbRatingConfig);
  private titleService = inject(Title);
  private navService = inject(NavService);

  baseUrl = inject(BASE_URL);

  param: Subscription;

  brand: Brand;

  os: OS;

  processor: Processor;

  ram: RAM;

  storage: Storage;

  queryParams: QueryParam;

  searchResult = signal<boolean>(true);

  minCustom: number;

  maxCustom: number;

  page = signal<number>(1);

  itemsPerPage = 24;

  data = signal<ProductSummary[]>([]);

  totalItems = signal<number>(0);

  isPrice = signal<string>('');

  brandOptions = this.homeService.brandOptions;

  osOptions = this.homeService.osOptions;

  ramOptions = this.homeService.ramOptions;

  processorOptions = this.homeService.processorOptions;

  storageOptions = this.homeService.storageOptions;

  priceOptions = this.homeService.priceOptions;

  searchString: string;

  showFilter = signal<boolean>(true);

  constructor() {
    const config = this.config;

    config.max = 5;
    config.readonly = true;
  }

  ngOnInit() {
    // display the option to add new laptop
    this.navService.newRoute(true);
    // route parameters
    this.routeParams();
  }

  routeParams() {
    this.param = this.route.queryParamMap.subscribe(params => {
      this.queryParams = params;
      // parses and converts back the query params to truthy checkbox values
      const results = this.homeService.parseQueryParams(this.queryParams);
      const { queryObj, pageTitle } = results;
      // set the page title dynamically
      if (pageTitle.length > 0) {
        this.titleService.setTitle(`Node Amazon: ${pageTitle.join(' / ')}`);
      } else {
        this.titleService.setTitle('Node Amazon: Laptops');
      }
      this.searchString = queryObj.search;
      this.brand = queryObj.brand;
      this.os = queryObj.os;
      this.isPrice.set(`${queryObj.min ? queryObj.min : ''},${
        queryObj.max ? queryObj.max : ''
      }`);
      // default to empty if no min or max
      if (this.isPrice() === ',') this.isPrice.set('');
      this.processor = queryObj.processor;
      this.ram = queryObj.ram;
      this.storage = queryObj.storage;
      // parseInt page otherwise ng2-pagination does not function correctly
      if (this.queryParams.params.page) this.page.set(parseInt(this.queryParams.params.page, 10));
      else this.page.set(1);
      // populate custom min and max
      if (
        this.isPrice()
        && !this.homeService.defaultPrices.includes(this.isPrice())
      ) {
        const price = this.isPrice().split(',');
        if (price[0]) this.minCustom = parseInt(price[0], 10);
        if (price[1]) this.maxCustom = parseInt(price[1], 10);
      }
      // get results based on the filter(s)
      this.getResults();
    });
  }

  getPage(page: number, queryParam: string) {
    // check if the user has input a custom minimum price
    const isMinCustom = !!(this.minCustom || this.minCustom === 0);

    // scroll to top on filter change
    window.scrollTo(0, 0);

    // On width < 768px, click on the Results tab.
    // This is to ensure the user sees the result(s) when a filter is selected/clicked.
    if (window.innerWidth < 768 && !this.showFilter()) {
      try {
        const resultsTab = document.getElementById('back-btn') as HTMLElement;
        resultsTab.click();
      } catch {
        // do nothing for now
      }
    }

    // page is always 1 when filter is added/removed
    if (queryParam && queryParam !== '') page = 1;

    // you can only choose one of the price filter
    if (queryParam === 'customPrice') {
      this.isPrice.set(`${this.minCustom ? this.minCustom : ''},${
        this.maxCustom ? this.maxCustom : ''
      }`);
      if (this.isPrice() === ',') this.isPrice.set('');
    } else if ((isMinCustom || this.maxCustom) && queryParam === 'price') {
      this.minCustom = null;
      this.maxCustom = null;
    }
    // collect all the checked values
    const tempObj = {
      brand: this.brand,
      os: this.os,
      price: this.isPrice(),
      processor: this.processor,
      ram: this.ram,
      storage: this.storage
    };
    // returns only truthy checked checkboxes which are formatted correctly
    const serializeQuery = this.homeService.serializeQueryParams(tempObj);
    // prepare query param
    const param: { page: number; min?: string; max?: string; search?: string } = { ...serializeQuery, page };
    // add custom price option if it exists to the query param
    if (isMinCustom && this.maxCustom) {
      param.min = `${this.minCustom}`;
      param.max = `${this.maxCustom}`;
    }
    if (this.searchString) {
      param.search = this.searchString;
    }

    // We are subscribing to route change up top
    this.router.navigate([''], {
      queryParams: param
    });
  }

  getResults() {
    // collect all the relevant values
    const tempObj = {
      brand: this.brand,
      os: this.os,
      processor: this.processor,
      ram: this.ram,
      storage: this.storage,
      page: this.page(),
      search: this.searchString,
      price: this.isPrice(),
      minCustom: this.minCustom,
      maxCustom: this.maxCustom
    };

    // query the database
    console.log(`[HomeComponent] getResults query.`);
    this.homeService.getAllProducts(tempObj).subscribe({
      next: (result) => {
        console.log(`[HomeComponent] getResults success. Total: ${result?.total}, Items: ${result?.data?.length}.`);
        this.searchResult.set(result.data.length !== 0);
        this.data.set(result.data);
        this.totalItems.set(result.total);
      },
      error: (err) => {
        console.error('[HomeComponent] getResults error:', err);
      }
    });
  }

  ngOnDestroy() {
    // prevent memory leaks
    this.param.unsubscribe();
    // remove the option to add new laptop
    this.navService.newRoute(false);
  }
}
