import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastr = inject(ToastrService);

  return next(req).pipe(
    catchError((error) => {
      if (!environment.production) {
        const details = [
          `${req.method} ${req.urlWithParams}`,
          `HTTP ${error.status ?? 'unknown'}: ${error.statusText || 'Unknown error'}`,
          error.message,
        ];
        if (error.status === 0) {
          details.push('No HTTP response was received. Check that the API is running, its HTTPS certificate is trusted, and CORS allows this origin. See the browser Network tab for the underlying connection error.');
        } else if (error.error != null) {
          details.push(typeof error.error === 'string'
            ? error.error
            : JSON.stringify(error.error, null, 2));
        }
        console.error('API request failed', req.method, req.urlWithParams, error);
        toastr.error(details.filter(Boolean).join('\n'), 'Development API error', {
          disableTimeOut: true,
          closeButton: true,
          tapToDismiss: false,
          enableHtml: false,
          toastClass: 'ngx-toastr dev-error-toast',
        });
      }
      if (error) {
        switch (error.status) {
          case 400:
            if (error.error?.errors) {
              const modalStateErrors = [];
              for (var key in error.error.errors) {
                if (error.error.errors[key]) {
                  modalStateErrors.push(error.error.errors[key]);
                }
              }

              throw modalStateErrors.flat();
            } else {
              toastr.error(error.statusText, error.status);
            }
            break;
          case 401:
            toastr.error(error.statusText, error.status);
            break;
          case 404:
            router.navigateByUrl('/not-found');
            break;
          case 500:
            const navigationExtras: NavigationExtras = {
              state: { error: error.error },
            };
            router.navigateByUrl('/server-error', navigationExtras);
            break;
          default:
            if (environment.production) toastr.error('Something unexpected went wrong');
            console.log(error);
            break;
        }
      }

      return throwError(() => error);
    })
  );
};
