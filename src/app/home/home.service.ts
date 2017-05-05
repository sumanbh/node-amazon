import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class HomeService {
    isNumber = Number.isFinite;
    priceName = {
        isUnder500: '{"min":0,"max":500}', is500to600: '{"min":500,"max":600}',
        is600to700: '{"min":600,"max":700}', is700to800: '{"min":700,"max":800}',
        is800to900: '{"min":800,"max":900}', is900to1000: '{"min":900,"max":1000}',
        isAbove1000: '{"min":1000,"max":20000}', isAllResults: '{"min":0,"max":20000}',
    };
    brandOptions = [
        'Apple', 'Microsoft', 'Asus', 'Dell', 'HP',
        'Samsung', 'Acer', 'Lenovo',
    ];
    priceOptions = [
        { name: 'Under $500', value: 'isUnder500' },
        { name: '$500 to $600', value: 'is500to600' },
        { name: '$600 to $700', value: 'is600to700' },
        { name: '$700 to $800', value: 'is700to800' },
        { name: '$800 to $900', value: 'is800to900' },
        { name: '$900 to $1000', value: 'is900to1000' },
        { name: 'Above $1000', value: 'isAbove1000' },
        { name: 'All Results', value: 'isAllResults' }
    ];
    osOptions = [
        'Mac OS X', 'Windows 10', 'Windows 8.1',
        'Windows 7 Home', 'Chrome OS',
    ];
    ramOptions = [
        '64', '32', '16', '12', '8', '4', '2',
    ];
    processorOptions = [
        'Intel Core i7', 'Intel Core i5', 'Intel Core i3',
        'Intel Core 2', 'AMD',
    ];
    storageOptions = [
        'SSD', 'Hard Disk',
    ];

    constructor(
        private http: Http
    ) { }

    getKeyByValue(object, value) {
        let res;
        Object.keys(object).some((key) => {
            if (object[key] === value) {
                res = key;
                return true;
            }
            return false;
        });
        return res;
    }

    serializeQueryParams(queryObj) {
        const serializedObj = {};
        const list = Object.keys(queryObj);
        let brands = [];
        let os = [];
        let processor = [];
        let storage = [];
        let ram = [];
        let min: number;
        let max: number;

        list.forEach((value) => {
            switch (value) {
                case 'brand': {
                    const keys = Object.keys(queryObj.brand);
                    brands = keys.filter(key => queryObj.brand[key]);
                    break;
                }
                case 'os': {
                    const keys = Object.keys(queryObj.os);
                    os = keys.filter(key => queryObj.os[key]);
                    break;
                }
                case 'price': {
                    const val = queryObj.price;
                    if (val.length > 0) {
                        if (JSON.parse(this.priceName[val[0]]).min < min || !min) min = JSON.parse(this.priceName[val[0]]).min;
                        if (JSON.parse(this.priceName[val[0]]).max < max || !max) max = JSON.parse(this.priceName[val[0]]).max;
                    }
                    break;
                }
                case 'processor': {
                    const keys = Object.keys(queryObj.processor);
                    processor = keys.filter(key => queryObj.processor[key]);
                    break;
                }
                case 'ram': {
                    const keys = Object.keys(queryObj.ram);
                    ram = keys.filter(key => queryObj.ram[key]);
                    break;
                }
                case 'storage': {
                    const keys = Object.keys(queryObj.storage);
                    storage = keys.filter(key => queryObj.storage[key]);
                    break;
                }
                default:
                /* do nothing */
            }
        });

        if (os.length > 0) serializedObj['os'] = os.join(',');
        if (brands.length > 0) serializedObj['brand'] = brands.join(',');
        if (processor.length > 0) serializedObj['processor'] = processor.join(',');
        if (storage.length > 0) serializedObj['storage'] = storage.join(',');
        if (ram.length > 0) serializedObj['ram'] = ram.join(',');
        if (max) serializedObj['price'] = `${min},${max}`;
        return serializedObj;
    }

    parseQueryParams(queryObj) {
        const allFilters = {
            brand: {}, os: {}, processor: {}, ram: {}, storage: {}, price: '',
        };
        queryObj.keys.forEach(element => {
            switch (element) {
                case 'brand': {
                    let arr = queryObj.params.brand;
                    if (!Array.isArray(arr)) arr = arr.split(',');
                    arr.forEach(value => allFilters.brand[value] = true);
                    break;
                }
                case 'os': {
                    let arr = queryObj.params.os;
                    if (!Array.isArray(arr)) arr = arr.split(',');
                    arr.forEach(value => allFilters.os[value] = true);
                    break;
                }
                case 'price': {
                    let str = queryObj.params.price;
                    if (Array.isArray(str)) break;
                    const priceArr = str.split(',');
                    str = JSON.stringify({ min: parseInt(priceArr[0], 10), max: parseInt(priceArr[1], 10) });
                    allFilters.price = this.getKeyByValue(this.priceName, str);
                    break;
                }
                case 'processor': {
                    let arr = queryObj.params.processor;
                    if (!Array.isArray(arr)) arr = arr.split(',');
                    arr.forEach(value => allFilters.processor[value] = true);
                    break;
                }
                case 'ram': {
                    let arr = queryObj.params.ram;
                    if (!Array.isArray(arr)) arr = arr.split(',');
                    arr.forEach(value => allFilters.ram[value] = true);
                    break;
                }
                case 'storage': {
                    let arr = queryObj.params.storage;
                    if (!Array.isArray(arr)) arr = arr.split(',');
                    arr.forEach(value => allFilters.storage[value] = true);
                    break;
                }
                default:
                /* do nothing */
            }
        });
        return allFilters;
    }

    getAllProducts(page: number, minCustom: number, maxCustom: number, obj: Object): Observable<any> {
        let productUrl = `/api/shop/${page}?obj=${JSON.stringify(obj)}`;  // api url
        if (this.isNumber(minCustom) && this.isNumber(maxCustom)) {
            productUrl += `&min=${minCustom}&max=${maxCustom}`;
        }
        return this.http.get(productUrl)
            .map((res: Response) => res.json());
    }
}
