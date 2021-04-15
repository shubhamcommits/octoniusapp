import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpRequest, HttpHandler, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { UtilityService } from '../services/utility-service/utility.service';


@Injectable()
export class ServerErrorInterceptor implements HttpInterceptor {

    constructor(private injector: Injector)
    { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let injector = this.injector.get(UtilityService);
        return next.handle(request).pipe(
            retry(2),
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    // refresh token
                    injector.clearAllNotifications();
                    injector.errorNotification('You are not authorized to proceed, kindly check your credentials!');
                } else {
                    return throwError(error);
                }
            })
        );
    }
}
