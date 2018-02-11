import { NgModule, APP_BOOTSTRAP_LISTENER, ApplicationRef } from '@angular/core';
import { ServerModule } from '@angular/platform-server';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';

import { ServerTransferStateModule } from '../modules/transfer-state/server-transfer-state.module';
import { TransferState } from '../modules/transfer-state/transfer-state';

import { first, filter } from 'rxjs/operators';

export function onBootstrap(appRef: ApplicationRef, transferState: TransferState) {
    return () => {
        appRef.isStable
            .pipe(
                filter(stable => stable),
                first()
            )
            .subscribe(() => {
                transferState.inject();
            });
    };
}

@NgModule({
    imports: [
        AppModule,
        ServerModule,
        ServerTransferStateModule,
    ],
    bootstrap: [AppComponent],
    providers: [
        {
            provide: APP_BOOTSTRAP_LISTENER,
            useFactory: onBootstrap,
            multi: true,
            deps: [
                ApplicationRef,
                TransferState
            ]
        }
    ]
})
export class AppServerModule { }
