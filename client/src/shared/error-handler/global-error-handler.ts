import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { UtilityService } from '../services/utility-service/utility.service';
import { ErrorService } from '../services/error-service/error.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

    constructor(private injector: Injector) { }

    handleError(error: Error | HttpErrorResponse) {
        const errorService = this.injector.get(ErrorService);
        const logger = this.injector.get(ErrorService);
        const notifier = this.injector.get(UtilityService);

        let message: string;
        let stackTrace: string;
        if (error instanceof HttpErrorResponse) {
            // Server error
            message = errorService.getServerErrorMessage(error);
            stackTrace = errorService.getServerStack(error);

            if(!error.url.includes('uploads')) {
                notifier.errorNotification(message);
            }
        } else {
            // Client Error
            message = errorService.getClientErrorMessage(error);
            // notifier.errorNotification(message);
        }
        // Always log errors
        logger.logError(message, stackTrace);
    }
}
