import { Observable } from 'rxjs';
import { Injectable, Inject } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { REQUEST } from '@nguniversal/express-engine/tokens';
import * as xhr2 from 'xhr2';

// @todo Fix this. Hack to pass cookie(s) down to express API server
xhr2.prototype._restrictedHeaders = {};

@Injectable()
export class HttpUniversalInterceptor implements HttpInterceptor {
  constructor(@Inject(REQUEST) private req: any) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const authReq = req.clone({
      setHeaders: { cookie: this.req.headers.cookie || '' }
    });

    return next.handle(authReq);
  }
}
