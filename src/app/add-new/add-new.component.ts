import { Component, OnInit, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NgbRatingConfig, NgbRating } from '@ng-bootstrap/ng-bootstrap';
import { Title } from '@angular/platform-browser';
import { NewLaptopResponse } from '../shared/types';
import { firstValueFrom } from 'rxjs';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-add-new',
    templateUrl: './add-new.component.html',
    styleUrls: ['./add-new.component.scss'],
    providers: [NgbRatingConfig],
    imports: [RouterLink, FormsModule, NgbRating]
})
export class AddNewComponent implements OnInit {
  private http = inject(HttpClient);
  private ratingConfig = inject(NgbRatingConfig);
  private titleService = inject(Title);

  operatingSystems = [
    'Mac OS X',
    'Chrome OS',
    'Windows 10',
    'Windows 8.1',
    'Windows 7 Home'
  ];

  processors = [
    'Intel Core i7',
    'Intel Core i5',
    'Intel Core i3',
    'Intel Core 2',
    'AMD'
  ];

  brands = [
    'Apple',
    'Microsoft',
    'HP',
    'Dell',
    'Asus',
    'Acer',
    'Samsung',
    'Lenovo',
    'Toshiba'
  ];

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
    rating: null
  };

  laptop = ({ ...this.defaultOptions });

  errorArr = [];

  errorText: string;

  imageErr = false;

  newLaptopId = signal<string | undefined>(undefined);

  constructor() {
    const ratingConfig = this.ratingConfig;

    ratingConfig.max = 5;
    ratingConfig.readonly = false;
  }

  ngOnInit() {
    this.titleService.setTitle('Add new laptop');
  }

  clearAll() {
    this.laptop = { ...this.defaultOptions };
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

  removeDescription(index: number) {
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
      const headers = new HttpHeaders({
        Accept: 'application/json',
        'Content-Type': 'application/json'
      });
      const apiUrl = '/api/user/laptop';

      firstValueFrom(
        this.http.post<NewLaptopResponse>(apiUrl, { laptop: this.laptop }, { headers })
      )
        .then((res: NewLaptopResponse) => {
          this.newLaptopId.set(res.id);
          this.clearAll();
          window.scrollTo(0, 0);
        })
        .catch(err => {
          this.errorArr = err.errors;
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
