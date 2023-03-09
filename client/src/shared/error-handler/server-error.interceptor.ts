import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpRequest, HttpHandler, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UtilityService } from '../services/utility-service/utility.service';


@Injectable()
export class ServerErrorInterceptor implements HttpInterceptor {

    constructor(private injector: Injector)
    { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let utilityService = this.injector.get(UtilityService);
        return next.handle(request).pipe(
            // retry(2),
            catchError((error: HttpErrorResponse) => {
                utilityService.clearAllNotifications();
                if (error.status === 0) {
                    utilityService.errorNotification($localize`:@@serverError.connectionError:Sorry, we are having a hard time connecting to the server. You have a poor connection.`);
                }
                if (error.status === 401) {
                    utilityService.errorNotification($localize`:@@serverError.notAuthorizedToProcced:You are not authorized to proceed, kindly check your credentials!`);
                } else {
                    return throwError(error);
                }
            })
        );
    }
}
