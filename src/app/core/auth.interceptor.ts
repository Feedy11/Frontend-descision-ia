import { inject }                          from '@angular/core';
import { HttpInterceptorFn, HttpRequest,
         HttpHandlerFn, HttpEvent }         from '@angular/common/http';
import { Observable }                      from 'rxjs';

/**
 * Automatically attaches the Bearer token stored in localStorage
 * to every outgoing HTTP request EXCEPT the login endpoint
 * (which uses x-www-form-urlencoded and must NOT have a Bearer header).
 */
export const authInterceptor: HttpInterceptorFn = (
  req   : HttpRequest<unknown>,
  next  : HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

  const token = localStorage.getItem('access_token');

  // Skip injecting token for the login endpoint
  const isLoginEndpoint = req.url.includes('/login/access-token');

  if (token && !isLoginEndpoint) {
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(authReq);
  }

  return next(req);
};
