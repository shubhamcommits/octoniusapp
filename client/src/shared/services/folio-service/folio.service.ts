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

  uploadFollioDocx(formData) {
    this._http.post(`${environment.FOLIO_UPLOAD_DOCX_URL}`, formData)
        .subscribe((response: any) => {
          // HTML data Converted
          // Setting follioService Subject for binding content in quill
        this.setNewFollioValue(response.message);
        })
  }

  follioSubject = new Subject<String>();

  uploadLoading = new Subject<Boolean>();

  setUploadLoading(state: Boolean) {
    this.uploadLoading.next(state)
  }

  setNewFollioValue(data: String) {
    this.follioSubject.next(data)
  }
}