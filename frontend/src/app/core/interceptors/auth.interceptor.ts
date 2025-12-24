import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, filter, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Auth interceptor
 * - Adds Authorization header to all API requests
 * - Handles 401 errors by refreshing tokens
 * - Redirects to login on refresh token expiration
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Skip auth header for login and refresh endpoints
  const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/refresh');
  
  // Clone request with auth header if token exists
  let authReq = req;
  if (!isAuthEndpoint) {
    const token = authService.getToken();
    if (token) {
      authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized errors
      if (error.status === 401 && !isAuthEndpoint) {
        // Check if we're already refreshing
        if (authService.isRefreshingToken) {
          // Wait for the refresh to complete
          return authService.refreshTokenSubject$.pipe(
            filter(token => token !== null),
            take(1),
            switchMap(token => {
              // Retry the request with new token
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${token}`
                }
              });
              return next(retryReq);
            })
          );
        } else {
          // Try to refresh the token
          return authService.refreshToken().pipe(
            switchMap(response => {
              // Retry the original request with new token
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${response.accessToken}`
                }
              });
              return next(retryReq);
            }),
            catchError(refreshError => {
              // Refresh failed, logout and redirect to login
              authService.logout();
              router.navigate(['/']);
              return throwError(() => refreshError);
            })
          );
        }
      }

      return throwError(() => error);
    })
  );
};

