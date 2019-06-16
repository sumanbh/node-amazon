import { NgModule } from '@angular/core';
import {
  ServerModule,
  ServerTransferStateModule
} from '@angular/platform-server';
import { ModuleMapLoaderModule } from '@nguniversal/module-map-ngfactory-loader';

import { AppBrowserModule } from './app.module';
import { AppComponent } from './app.component';

@NgModule({
  imports: [
    AppBrowserModule,
    ServerModule,
    ModuleMapLoaderModule,
    ServerTransferStateModule
  ],
  bootstrap: [AppComponent]
})
export class AppServerModule {}
