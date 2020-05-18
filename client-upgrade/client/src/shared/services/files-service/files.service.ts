import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  constructor(private _http: HttpClient) { }

  baseURL = environment.UTILITIES_BASE_API_URL;

  /**
   * This function is responsible for uploding a file to the group
   * @param fileData 
   */
  addFile(fileData: any, fileToUpload: File) {

    // PREPARING FORM DATA
    let formData = new FormData();

    // Adding File Data
    formData.append('fileData', JSON.stringify(fileData))

    // Appending file
    formData.append('file', fileToUpload, fileToUpload['name'])

    return this._http.post(this.baseURL + `/files/groups`, formData).toPromise()
  }

  /**
   * This function is responsible for fetching list of files
   * @param groupId 
   * @param lastFileId 
   */
  get(groupId: string, lastFileId: string) {

    if (lastFileId) {
      return this._http.get(this.baseURL + `/files/groups`, {
        params: {
          groupId: groupId,
          lastFileId: lastFileId
        }
      }).toPromise()
    } else {
      return this._http.get(this.baseURL + `/files/groups`, {
        params: {
          groupId: groupId
        }
      }).toPromise()
    }
  }

  /**
   * This function is responsible searching files inside of a group
   * @param groupId 
   * @param query 
   */
  searchFiles(groupId: string, query: any) {
    return this._http.get(this.baseURL + `/files/search`, {
      params: {
        groupId: groupId,
        query: query
      }
    }).toPromise()
  }

}
