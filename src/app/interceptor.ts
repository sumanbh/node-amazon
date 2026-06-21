import { inject } from '@angular/core';
import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { REQUEST } from './express.tokens';

export function cookiesInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const ssrRequest = inject(REQUEST, { optional: true });

  const isApiRequest = req.url.includes('/api/') || req.url.includes('/auth/');

  if (isApiRequest) {
    const clonedReq = req.clone({
      withCredentials: true,
      ...(ssrRequest ? { setHeaders: { cookie: ssrRequest.headers.cookie || '' } } : {})
    });
    return next(clonedReq);
  }

  return next(req);
}
