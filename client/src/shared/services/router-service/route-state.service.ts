import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RouteStateService {

  private pathParamsState = new BehaviorSubject<any>({});

  pathParams: Observable<any>;

  constructor() { 
    this.pathParams = this.pathParamsState.asObservable();
  }

  updatePathParamState(newPathParams:any){
    this.pathParamsState.next(newPathParams);
  }
}
