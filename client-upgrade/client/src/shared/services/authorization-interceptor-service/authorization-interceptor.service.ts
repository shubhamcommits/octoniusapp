import { Injectable, Injector } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { StorageService } from '../storage-service/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationInterceptorService implements HttpInterceptor {

  constructor(private injector: Injector) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{
    const storageService = this.injector.get(StorageService);
    if(storageService.existData('authToken')){
      const tokenizedRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${storageService.getLocalData('authToken')}`
        }
      });
      return next.handle(tokenizedRequest);
    }
    return next.handle(request.clone());
  }
  
}
