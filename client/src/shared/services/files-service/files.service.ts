import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  constructor(private _http: HttpClient) { }

  baseURL = environment.UTILITIES_BASE_API_URL;
  baseNotificationURL = environment.NOTIFICATIONS_BASE_API_URL;

  /**
   * This function is responsible for uploding a file to the group
   * @param fileData
   */
  addFile(fileData: any, fileToUpload?: File) {

    // PREPARING FORM DATA
    let formData = new FormData();

    // Adding File Data
    formData.append('fileData', JSON.stringify(fileData))

    // Appending file
    if(fileToUpload)
        formData.append('file', fileToUpload, fileToUpload['name'])

    return this._http.post(this.baseURL + `/files/groups`, formData).toPromise()
  }

  /**
   * This function is responsible for fetching list of files
   * @param groupId
   * @param lastFileId
   */
  get(groupId: string, folderId: string, lastFileId: string) {

    if (lastFileId) {
      return this._http.get(this.baseURL + `/files/groups`, {
        params: {
          groupId: groupId,
          folderId: folderId,
          lastFileId: lastFileId
        }
      }).toPromise()
    } else {
      return this._http.get(this.baseURL + `/files/groups`, {
        params: {
          groupId: groupId,
          folderId: folderId
        }
      }).toPromise()
    }
  }

  /**
   * This function is responsible for fetching the file details on the basis of the fileId
   * @param fileId
   */
  getOne(fileId: string){
    if(fileId)
      return this._http.get(this.baseURL + `/files/${fileId}`).toPromise()
  }

  /**
   * This function is responsible for editing the file details on the basis of the fileId
   * @param fileId
   * @param file
   */
  edit(fileId: string, file: any){
    if(fileId)
      return this._http.put(this.baseURL + `/files/${fileId}`, {
          file: file
      }).toPromise()
  }

  /**
   * This function is responsible searching files inside of a group
   * @param groupId
   * @param query
   * @param postRef
   */
  searchFiles(groupId: string, query: any, postRef?: any) {
    return this._http.get(this.baseURL + `/files/search`, {
      params: {
        groupId: groupId,
        query: query,
        postRef: postRef
      }
    }).toPromise()
  }

  /**
   * This function is used to delete a file
   * @param fileId
   */
  deleteFile(fileId: string) {
    return this._http.delete(this.baseURL + `/files/${fileId}`).toPromise();
  }

  /**
   * This function is responsible for sending a notification to a user mentioned in a folio
   * @param mention
   * @param folioId
   * @param userId
   */
  async newFolioMention(mention: any, fileId: string, userId: string) {

    return this._http.post(this.baseNotificationURL + '/new-folio-mention', {
      mention: mention.id,
      file: fileId,
      user: userId
    });
  }

  async transferToGroup(fileId: string, groupId: string, isCopy: boolean) {
    if (isCopy) {
      return this._http.post(this.baseURL + `/files/${fileId}/copy-to-group`, { groupId: groupId }).toPromise();
    }
    return this._http.put(this.baseURL + `/files/${fileId}/move-to-group`, { groupId: groupId }).toPromise();
  }
}
