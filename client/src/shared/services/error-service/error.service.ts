import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor() { }

  getClientErrorMessage(error: Error): string {
    return error.message ?
      error.message :
      error.toString();
  }

  getClientStack(error: Error): string {
    return error.stack;
  }

  getServerErrorMessage(error: HttpErrorResponse): string {
    return error.message ?
      error.message :
      'No Internet Connection';
  }

  getServerStack(error: HttpErrorResponse): string {
    // handle stack trace
    return 'stack';
  }

  logError(message: string, stack: string) {
    // Send errors to server here
    console.error('LoggingService: ' + message);
  }
}
