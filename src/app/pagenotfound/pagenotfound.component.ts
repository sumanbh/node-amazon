import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'app-page-not-found',
    templateUrl: 'pagenotfound.component.html',
    styleUrls: ['pagenotfound.component.css']
})
export class PageNotFoundComponent implements OnInit {
    constructor(
        private titleService: Title,
    ) { }

    ngOnInit() {
        this.titleService.setTitle('404');
     }
}
