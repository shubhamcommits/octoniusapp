import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CollaboraOfficeService {

  constructor(private _http: HttpClient) { }

  baseUrl = environment.UTILITIES_BASE_API_URL;

  getCollaboraUrl() {
    return this._http.get(this.baseUrl + '/collaboraoffice/collaboraUrl').toPromise();
  }

  checkFileInfo(fileId: string) {
    return this._http.get(this.baseUrl + `/collaboraoffice/wopi/files/${fileId}`, {
      params: {
      }
    }).toPromise();
  }

  getFile(fileId: string) {
    return this._http.get(this.baseUrl + `/collaboraoffice/wopi/files/${fileId}/contents`, {
      params: {
      }
    }).toPromise();
  }

  putFile(fileId: string) {
    return this._http.put(this.baseUrl + `/collaboraoffice/wopi/files/${fileId}/contents`, {
      params: {
      }
    }).toPromise();
  }
}
