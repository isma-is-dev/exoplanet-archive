import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, retry, timer } from 'rxjs';

export const retryInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  return next(req).pipe(
    retry({
      count: 2,
      delay: (error: HttpErrorResponse, retryCount: number) => {
        // No reintentar si el servidor no responde (connection refused / offline)
        if (error.status === 0) {
          throw error;
        }
        // Solo reintentar en errores del servidor (5xx)
        if (error.status < 500) {
          throw error;
        }
        // Backoff exponencial: 500ms, 1000ms
        const delayMs = Math.pow(2, retryCount) * 500;
        return timer(delayMs);
      },
    }),
    catchError((error: HttpErrorResponse) => {
      throw error;
    })
  );
};
