import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, retry, timer } from 'rxjs';

export const retryInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  return next(req).pipe(
    retry({
      count: 3,
      delay: (error: HttpErrorResponse, retryCount: number) => {
        // Backoff exponencial: 500ms, 1000ms, 2000ms
        const delayMs = Math.pow(2, retryCount) * 500;
        return timer(delayMs);
      },
    }),
    catchError((error: HttpErrorResponse) => {
      // Re-lanzar el error después de agotar los reintentos
      throw error;
    })
  );
};
