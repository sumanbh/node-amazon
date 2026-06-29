import { inject } from '@angular/core';
import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { REQUEST } from '@angular/core';

export function cookiesInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const ssrRequest = inject(REQUEST, { optional: true }) as {
    headers?: {
      cookie?: string;
      get?: (name: string) => string | null;
    };
  } | null;

  const isApiRequest = req.url.includes('/api/') || req.url.includes('/auth/');

  if (isApiRequest) {
    let cookieValue = '';
    if (ssrRequest) {
      const headers = ssrRequest.headers;
      if (headers) {
        if (typeof headers.get === 'function') {
          cookieValue = headers.get('cookie') || '';
        } else if (headers.cookie) {
          cookieValue = headers.cookie;
        }
      }
    }

    const clonedReq = req.clone({
      withCredentials: true,
      ...(cookieValue ? { setHeaders: { cookie: cookieValue } } : {})
    });
    return next(clonedReq);
  }

  return next(req);
}


