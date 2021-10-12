import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FolioService {

  constructor(private _http: HttpClient) {
    this.setUploadLoading(false)
  }

  follioSubject = new Subject<String>();

  uploadLoading = new Subject<Boolean>();

  setUploadLoading(state: Boolean) {
    this.uploadLoading.next(state)
  }

  setNewFollioValue(data: String) {
    this.follioSubject.next(data)
  }

  uploadFollioDocx(formData) {
    return this._http.post(`${environment.FOLIO_HTTP_URL}/upload`, formData).toPromise();
  }
}
