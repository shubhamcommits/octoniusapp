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
    formData.append('fileData', JSON.stringify(fileData));

    // Appending file
    if(fileToUpload)
        formData.append('file', fileToUpload, fileToUpload['name']);

    return this._http.post(this.baseURL + `/files/groups`, formData).toPromise();
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

  getFilteredFiles(groupId: string, folderId: string, filterBit: string, filterData: any) {
    return this._http.get(this.baseURL + `/files/filter`, {
      params: {
        groupId: groupId,
        folderId: folderId,
        filterBit: filterBit,
        filterData: JSON.stringify(filterData)
      }
    }).toPromise();
  }

  /**
   * This function is responsible for fetching the file details on the basis of the groupId
   * @param groupId
   */
  getCampaignFiles(groupId: string) {
    if (groupId)
      return this._http.get(this.baseURL + `/files/groups/campaign`, {
        params: {
          groupId: groupId
        }
      }).toPromise()
  }

  /**
   * This function is responsible for fetching the file details on the basis of the fileId
   * @param fileId
   */
  getOne(fileId: string, readOnly?: boolean){
    if(fileId) {
      return this._http.get(this.baseURL + `/files/${fileId}`, {
        params: {
          readOnly: readOnly
        }
      }).toPromise();
    }
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
  searchFiles(groupId: string, query: any, postRef?: any, workspaceId?: string) {
    return this._http.get(this.baseURL + `/files/search`, {
      params: {
        groupId: groupId,
        query: query,
        postRef: postRef,
        workspaceId: workspaceId
      }
    }).toPromise()
  }

  /**
   * This function is used to delete a file
   * @param fileId
   * @param fileName
   */
  deleteFile(fileId: string, fileName: any, workspaceId: string, flamingoType?: boolean) {
    return this._http.request('delete', this.baseURL + `/files/${fileId}`, {
      body: {
        fileName: fileName,
        flamingoType: flamingoType,
        workspaceId: workspaceId
      }
    }).toPromise();
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

  /**
   * Move a file to another folder
   *
   * @param fileId
   * @param folderId
   */
   async moveToFolder(fileId: string, folderId: string) {
    return this._http.put(this.baseURL + `/files/${fileId}/move-to-folder`, { folderId: folderId }).toPromise();
  }

  /**
   *
   * STARTING THE BLOCK OF METHODS TO UPDATE THE RIGHTS OF A FILE
   *
   */
  selectPermissionRight(permissionId: string, fileId: string, right: string) {
    // Call the HTTP Request
    return this._http.put(this.baseURL + `/files/permissions/${fileId}/selectPermissionRight`, { right, permissionId }).toPromise();
  }

  removePermission(permissionId: string, fileId: string) {
    // Call the HTTP Request
    return this._http.put(this.baseURL + `/files/permissions/${fileId}/removePermission`, { permissionId }).toPromise();
  }

  addTagToPermission(permissionId: string, fileId: string, tag: string) {
    // Call the HTTP Request
    return this._http.put(this.baseURL + `/files/permissions/${fileId}/addTagToPermission`, { permissionId, tag }).toPromise();
  }

  removePermissionTag(permissionId: string, fileId: string, tag: string) {
    // Call the HTTP Request
    return this._http.put(this.baseURL + `/files/permissions/${fileId}/removePermissionTag`, { permissionId, tag }).toPromise();
  }

  addMemberToPermission(fileId: string, permissionId: string, member: any) {
    // Call the HTTP Request
    return this._http.put(this.baseURL + `/files/permissions/${fileId}/addMemberToPermission`, { permissionId, member }).toPromise();
  }

  removeMemberFromPermission(fileId: string, permissionId: string, memberId: string) {
    // Call the HTTP Request
    return this._http.put(this.baseURL + `/files/permissions/${fileId}/removeMemberFromPermission`, { permissionId, memberId }).toPromise();
  }
  /**
   *
   * ENDS THE BLOCK OF METHODS TO UPDATE THE RIGHTS OF A FILE
   *
   */

  /**
   * This function is used to save a custom field value
   * @param postId
   */
   saveCustomField(postId: string, customFieldName: string, customFieldValue: string) {
    // Call the HTTP Request
    return this._http.put(this.baseURL + `/files/${postId}/customField`, {
      customFieldName: customFieldName,
      customFieldValue: customFieldValue
    }).toPromise();
  }

  getFileVersions(fileId: string) {
    return this._http.get(this.baseURL + `/files/${fileId}/fileVersions`, {}).toPromise();
  }

  getFileLastVersion(fileId: string) {
    return this._http.get(this.baseURL + `/files/${fileId}/lastVersion`, {}).toPromise();
  }

  getPathToFile(fileId: string) {
    return this._http.get(this.baseURL + `/files/${fileId}/fullPathString`, {}).toPromise();
  }

  getMinioFile(fileId: string, modified_name: string, workspaceId: string, token: string) {
    return this._http.get(this.baseURL + `/files/${fileId}/minio`, {
      params: {
        token: token,
        modified_name: modified_name,
        workspaceId: workspaceId
      }
    }).toPromise();
  }
}
