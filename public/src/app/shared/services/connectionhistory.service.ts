import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable()
export class ConnectionHistoryService {

BASE_API_URL = environment.BASE_API_URL;

constructor(private _http: HttpClient) { }

  // METHODS TO HANDLE HTTP REQUESTS

  updateConnectionHistory(history) {
    return this._http.post(this.BASE_API_URL + '/posts/documents/history/', history);
  }
}
