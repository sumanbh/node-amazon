import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class HomeService {
    isNumber = Number.isFinite;
    brandName = {
        Asus: 'asus', Acer: 'acer', Apple: 'apple', HP: 'hp',
        Microsoft: 'microsoft', Lenovo: 'lenovo', Dell: 'dell', Samsung: 'samsung',
    };
    osName = {
        Mac: 'mac', Win10: 'win10', Chrome: 'chrome', Win8: 'win8', Win7: 'win7',
    };
    processorName = {
        i7: 'i7', i5: 'i5', i3: 'i3', Core2: 'core2', Athlon: 'athlon',
    };
    storageName = {
        SSD: 'ssd',
        HardDrive: 'harddrive',
    };
    ramName = {
        is64andAbove: '64', is32: '32', is16: '16', is8: '8', is4: '4', is2: '2', is12: '12',
    };
    priceName = {
        isUnder500: '{"min":0,"max":500}', is500to600: '{"min":500,"max":600}',
        is600to700: '{"min":600,"max":700}', is700to800: '{"min":700,"max":800}',
        is800to900: '{"min":800,"max":900}', is900to1000: '{"min":900,"max":1000}',
        isAbove1000: '{"min":1000,"max":20000}', isAllResults: '{"min":0,"max":20000}',
    };

    constructor(
        private http: Http
    ) { }

    getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] === value);
    }

    intersection(...arg) {
        return arg.reduce((previous, current) => {
            return previous.filter((element) => {
                return current.indexOf(element) > -1;
            });
        });
    };

    serializeQueryParams(queryObj) {
        const serializedObj = {};
        const keys = Object.keys(queryObj);
        const filtered = keys.filter(key => queryObj[key]);
        const brands = [];
        const os = [];
        const processor = [];
        const storage = [];
        const ram = [];
        let min: number;
        let max: number;

        filtered.forEach((value) => {
            if (this.brandName[value]) {
                brands.push(value);
            } else if (this.osName[value]) {
                os.push(value);
            } else if (this.processorName[value]) {
                processor.push(value);
            } else if (this.storageName[value]) {
                storage.push(value);
            } else if (this.ramName[value]) {
                ram.push(this.ramName[value]);
            } else if (this.priceName[value]) {
                if (JSON.parse(this.priceName[value]).min < min || !min) min = JSON.parse(this.priceName[value]).min;
                if (JSON.parse(this.priceName[value]).max < max || !max) max = JSON.parse(this.priceName[value]).max;
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
            brand: {}, os: {}, processor: {}, ram: {}, storage: {}, price: {},
        };
        queryObj.keys.forEach(element => {
            switch (element) {
                case 'brand': {
                    let obj = queryObj.params.brand;
                    const result = [];
                    if (Array.isArray(obj)) obj = obj.join(',');
                    const brands = this.intersection(obj.toLowerCase().split(','), Object.values(this.brandName));
                    brands.forEach(value => allFilters.brand[this.getKeyByValue(this.brandName, value)] = true);
                    break;
                }
                case 'os': {
                    let obj = queryObj.params.os;
                    const result = [];
                    if (Array.isArray(obj)) obj = obj.join(',');
                    const os = this.intersection(obj.toLowerCase().split(','), Object.values(this.osName));
                    os.forEach(value => allFilters.os[this.getKeyByValue(this.osName, value)] = true);
                    break;
                }
                case 'price': {
                    let obj = queryObj.params.price;
                    const result = [];
                    if (Array.isArray(obj)) break;
                    const priceArr = obj.split(',');
                    obj = [JSON.stringify({ min: parseInt(priceArr[0], 10), max: parseInt(priceArr[1], 10) })];
                    const price = this.intersection(obj, Object.values(this.priceName));
                    price.forEach(value => allFilters.price = this.getKeyByValue(this.priceName, value));
                    break;
                }
                case 'processor': {
                    let obj = queryObj.params.processor;
                    const result = [];
                    if (Array.isArray(obj)) obj = obj.join(',');
                    const processor = this.intersection(obj.toLowerCase().split(','), Object.values(this.processorName));
                    processor.forEach(value => allFilters.processor[this.getKeyByValue(this.processorName, value)] = true);
                    break;
                }
                case 'ram': {
                    let obj = queryObj.params.ram;
                    const result = [];
                    if (Array.isArray(obj)) obj = obj.join(',');
                    const ram = this.intersection(obj.toLowerCase().split(','), Object.values(this.ramName));
                    ram.forEach(value => allFilters.ram[this.getKeyByValue(this.ramName, value)] = true);
                    break;
                }
                case 'storage': {
                    let obj = queryObj.params.storage;
                    const result = [];
                    if (Array.isArray(obj)) obj = obj.join(',');
                    const storage = this.intersection(obj.toLowerCase().split(','), Object.values(this.storageName));
                    storage.forEach(value => allFilters.storage[this.getKeyByValue(this.storageName, value)] = true);
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
