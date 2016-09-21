import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

@Injectable()
export class ShopService {
    public _brand: string = '';
    public _os: string = '';
    public _ram: string = '';
    public _processor: string = '';
    public _storage: string = '';

    private _brandName: string[] = ['Asus', 'Acer', 'Apple', 'HP', 'Microsoft', 'Lenovo', 'Dell', 'Samsung'];
    private _osName: string[] = ['Mac OS X', 'Windows 10', 'Chrome OS', 'Windows 8.1', 'Windows 7 Home'];
    private _processorName: string[] = ['Intel Core i7', 'Intel Core i5', 'Intel Core i3', 'Intel Core 2', 'AMD'];
    private _storageName: string[] = ['SSD', 'Hard Disk'];

    private queryCollector = [];
    private osCollector = [];
    private ramCollector = [];
    private processorCollector = [];
    private storageCollector = [];
    private minCollector = [];
    private maxCollector = [];

    constructor(
        private http: Http
    ) { }

    getAllProducts(page: number, _queryParam: string, min: number, max: number) {
        // For insert/remove on checkbox
        function _without(value) { return value != _queryParam;}
        function _withoutMin(value) { return value != min;}
        function _withoutMax(value) { return value != max;}

        if (this._brandName.indexOf(_queryParam) >= 0) {
            if (this.queryCollector.length >= 1 && this.queryCollector.indexOf(_queryParam) !== -1) {
                this.queryCollector = this.queryCollector.filter(_without);
            }
            else if (_queryParam !== '') this.queryCollector.push(_queryParam);
        }
        else if (this._osName.indexOf(_queryParam) >= 0) {
            if (this.osCollector.length >= 1 && this.osCollector.indexOf(_queryParam) !== -1) {
                this.osCollector = this.osCollector.filter(_without);
            }
            else if (_queryParam !== '') this.osCollector.push(_queryParam);
        }
        else if (parseInt(_queryParam)) {  //only queryparam with numbers in it
            if (this.ramCollector.length >= 1 && this.ramCollector.indexOf(_queryParam) !== -1) {
                this.ramCollector = this.ramCollector.filter(_without);
            }
            else if (_queryParam !== '') this.ramCollector.push(_queryParam);
        }
        else if (this._processorName.indexOf(_queryParam) >= 0) {
            if (this.processorCollector.length >= 1 && this.processorCollector.indexOf(_queryParam) !== -1) {
                this.processorCollector = this.processorCollector.filter(_without);
            }
            else if (_queryParam !== '') this.processorCollector.push(_queryParam);
        }
        else if (this._storageName.indexOf(_queryParam) >= 0) {
            if (this.storageCollector.length >= 1 && this.storageCollector.indexOf(_queryParam) !== -1) {
                this.storageCollector = this.storageCollector.filter(_without);
            }
            else if (_queryParam !== '') this.storageCollector.push(_queryParam);
        }
        else if (min || max) {
            if (this.minCollector.length >= 1 && this.minCollector.indexOf(min) !== -1) {
                this.minCollector = this.minCollector.filter(_withoutMin);
            }
            else this.minCollector.push(min);

            if (this.maxCollector.length >= 1 && this.maxCollector.indexOf(max) !== -1) {
                this.maxCollector = this.maxCollector.filter(_withoutMax);
            }
            else this.maxCollector.push(max);
        }

        // console.log('Min and max: ', min, max);
        if (this.minCollector.length >= 1 && this.maxCollector.length >= 1) {
            min = Math.min(...this.minCollector);
            max = Math.max(...this.maxCollector);
        }
        else {
            min = 0; //default values
            max = 20000;
        }

        // console.log('Temp Min and max array: ', this.minCollector, this.maxCollector);
        // console.log(' Min and max: ', min, max);

        this._brand = this.queryCollector.join(',');
        this._os = this.osCollector.join(',');
        this._ram = this.ramCollector.join(',');
        this._processor = this.processorCollector.join(',');
        this._storage = this.storageCollector.join(',');

        let productUrl = `/api/shop/${page}?brand=${this._brand}&os=${this._os}&ram=${this._ram}&processor=${this._processor}&storage=${this._storage}&min=${min}&max=${max}`;  //api url
        
        return this.http.get(productUrl)
            .map((res: any) => res.json());
    }
}