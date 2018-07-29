import { Component, OnInit } from '@angular/core';
import { Headers, Response } from '@angular/http';
import { AuthHttp } from 'angular2-jwt';
import { NgbRatingConfig } from '@ng-bootstrap/ng-bootstrap';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'app-add-new',
    templateUrl: './add-new.component.html',
    styleUrls: ['./add-new.component.scss'],
    providers: [NgbRatingConfig],
})
export class AddNewComponent implements OnInit {
    operatingSystems = ['Mac OS X', 'Chrome OS', 'Windows 10', 'Windows 8.1', 'Windows 7 Home'];
    processors = ['Intel Core i7', 'Intel Core i5', 'Intel Core i3', 'Intel Core 2', 'AMD'];
    brands = ['Apple', 'Microsoft', 'HP', 'Dell', 'Asus', 'Acer', 'Samsung', 'Lenovo', 'Toshiba'];
    storageTypes = ['SSD', 'Hard Disk'];
    // initialize default laptop options
    defaultOptions = {
        title: '',
        image: '',
        ram: null,
        storage: null,
        description: ['', '', '', ''],
        os: null,
        processor: null,
        storageType: null,
        brand: null,
        limit: false,
        price: null,
        rating: null,
    }
    laptop = Object.assign({}, this.defaultOptions);
    errorArr = [];
    errorText: string;
    imageErr = false;
    newLaptopId: string;

    constructor(
        private authHttp: AuthHttp,
        private ratingConfig: NgbRatingConfig,
        private titleService: Title,
    ) {
        ratingConfig.max = 5;
        ratingConfig.readonly = false;
    }

    ngOnInit() {
        this.titleService.setTitle('Add new laptop');
    }

    trackByFn(index: any, item: any) {
        return index;
    }

    clearAll() {
        this.laptop = Object.assign({}, this.defaultOptions);
        // because Object.assign does not deep clone
        this.laptop.description = ['', '', '', ''];
        // Clear Errors
        this.errorArr = [];
        this.updateErrorText();
    }

    addDescription() {
        if (this.laptop.description.length < 8) {
            this.laptop.description.push('');
            this.laptop.limit = false;
        } else {
            this.laptop.limit = true;
        }
    }

    removeDescription(index: any) {
        if (this.laptop.description.length > 1) {
            this.laptop.limit = false;
            this.laptop.description.splice(index, 1);
        }
    }

    updateErrorText() {
        this.errorText = this.errorArr.join(', ');
    }

    imageError() {
        this.imageErr = true;
        if (!this.errorArr.includes('Image URL')) {
            this.errorArr.push('Image URL');
            this.updateErrorText();
        }
    }

    imageLoad() {
        this.imageErr = false;
        const index = this.errorArr.indexOf('Image URL');
        if (index !== -1) {
            this.errorArr.splice(index, 1);
        }
        if (this.errorArr.length === 0) {
            this.errorText = null;
        } else {
            this.updateErrorText();
        }
    }

    submit(): void {
        if (!this.imageErr && this.laptop.image) {
            const headers = new Headers({ Accept: 'application/json', 'Content-Type': 'application/json' });
            const apiUrl = '/api/user/laptop';

            this.authHttp.post(apiUrl, { laptop: this.laptop }, { headers: headers })
                .toPromise()
                .then((response) => {
                    const res = response.json();
                    this.newLaptopId = res.id;
                    this.clearAll();
                    window.scrollTo(0, 0);
                })
                .catch((err) => {
                    const error = err.json();
                    this.errorArr = error.errors;
                    this.updateErrorText();
                    window.scrollTo(0, 0);
                });
        } else {
            this.errorArr.push('Image URL');
            this.updateErrorText();
            window.scrollTo(0, 0);
        }
    }
}
