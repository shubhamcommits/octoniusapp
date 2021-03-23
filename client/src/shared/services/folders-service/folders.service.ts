import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FoldersService {

  constructor(private _http: HttpClient) { }

  baseURL = environment.UTILITIES_BASE_API_URL;
  baseNotificationURL = environment.NOTIFICATIONS_BASE_API_URL;

  /**
   * This function is responsible for uploding a folder to the group
   * @param folderData
   */
  add(folderData: any) {

    // PREPARING FORM DATA
    let formData = new FormData();

    // Adding folder Data
    formData.append('folderData', JSON.stringify(folderData));

    return this._http.post(this.baseURL + `/folders/groups`, formData).toPromise()
  }

  /**
   * This function is responsible for fetching list of folders
   * @param groupId
   */
  get(groupId: string, folderId: string) {
    return this._http.get(this.baseURL + `/folders/groups`, {
      params: {
        groupId: groupId,
        folderId: folderId
      }
    }).toPromise();
  }

  /**
   * This function is responsible for fetching the folder details on the basis of the folderId
   * @param folderId
   */
  getOne(folderId: string){
    if(folderId)
      return this._http.get(this.baseURL + `/folders/${folderId}`).toPromise()
  }

  /**
   * This function is responsible for editing the folder details on the basis of the folderId
   * @param folderId
   */
  edit(folderId: string, folderName: string){
    return this._http.put(this.baseURL + `/folders/${folderId}`, {folderName: folderName}).toPromise()
  }

  /**
   * This function is used to delete a folder
   * @param folderId
   */
  deleteFolder(folderId: string) {
    return this._http.delete(this.baseURL + `/folders/${folderId}`).toPromise();
  }

  /**
   * Move a folder to another folder
   *
   * @param folderId
   * @param parentFolderId
   */
  async moveToFolder(folderId: string, parentFolderId: string) {
    return this._http.put(this.baseURL + `/folders/${folderId}/move-to-folder`, { parentFolderId: parentFolderId }).toPromise();
  }
}
