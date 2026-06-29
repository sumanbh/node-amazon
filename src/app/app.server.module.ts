import { NgModule } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';

import { AppBrowserModule } from './app.module';
import { AppComponent } from './app.component';
import { serverRoutes } from './app.routes.server';

@NgModule({
  imports: [
    AppBrowserModule
  ],
  providers: [
    provideServerRendering(withRoutes(serverRoutes))
  ],
  bootstrap: [AppComponent],
})
export class AppServerModule {}

