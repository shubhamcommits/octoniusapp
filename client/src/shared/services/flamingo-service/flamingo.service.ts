import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FlamingoService {

  constructor(private _http: HttpClient) { }

  baseURL = environment.FLAMINGO_BASE_API_URL;

  /**
   * This function is responsible for uploding a file to the group
   * @param flamingoData
   */
  createForm(flamingoData: any, ) {
    
    return this._http.post(this.baseURL + `/create-form`, {flamingoData}).toPromise()
  }

  /**
   * This function is responsible for fetching list of files
   * @param groupId
   * @param lastFormId
   */
  get(groupId: string, lastFormId: string) {

    if (lastFormId) {
      return this._http.get(this.baseURL + `/`, {
        params: {
          groupId: groupId,
          lastFileId: lastFormId
        }
      }).toPromise()
    } else {
      return this._http.get(this.baseURL + `/`, {
        params: {
          groupId: groupId,
        }
      }).toPromise()
    }
  }
}
