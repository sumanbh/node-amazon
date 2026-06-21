import { Component, OnInit, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-page-not-found',
    templateUrl: 'pagenotfound.component.html',
    styleUrls: ['pagenotfound.component.scss'],
    imports: [RouterLink]
})
export class PageNotFoundComponent implements OnInit {
  private titleService = inject(Title);


  ngOnInit(): void {
    this.titleService.setTitle('404');
  }
}
