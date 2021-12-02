import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoungeService {

  baseUrl = environment.WORKSPACE_BASE_API_URL;

  constructor(private _http: HttpClient) { }

  /**
   * This function is responsible for fetching an specific section by id
   * @param loungeId
   */
   getLounge(loungeId: string) {
    return this._http.get(this.baseUrl + `/lounges/one/${loungeId}`).toPromise();
  }

  /**
   * This function is responsible for fetching all the stories & events present in a workspace
   * @param workspaceId
   * @param loungeId
   */
  getAllStories(workspaceId: string, loungeId?: string) {
    return this._http.get(this.baseUrl + `/lounges/allStories`, {
      params:{
        workspaceId: workspaceId,
        loungeId: loungeId || ''
      }
    }).toPromise()
  }

  /**
   * This function is responsible for fetching all the lounges present in a workspace
   * @param workspaceId
   */
  getAllLounges(workspaceId: string, categoryId?: string) {
    return this._http.get(this.baseUrl + `/lounges/all`, {
      params:{
        workspaceId: workspaceId,
        categoryId: categoryId || ''
      }
    }).toPromise()
  }

  /**
   * This function is responsible for fetching all the categories present in a workspace
   * @param workspaceId
   */
  getAllCategories(workspaceId: string) {
    return this._http.get(this.baseUrl + `/lounges/allCategories`, {
      params:{
        workspaceId: workspaceId
      }
    }).toPromise()
  }

  /**
   * This function is responsible for adding a lounge to the workspace
   * @param groupId
   */
  addLounge(lounge: any) {
    return this._http.post(this.baseUrl + `/lounges/`, { lounge }).toPromise();
  }

  /**
   * This function is responsible to renaming a lounge
   * @param loungeId
   * @param newName
   */
  editLounge(loungeId: string, properties: any) {
    return this._http.put(this.baseUrl + `/lounges/${loungeId}`, { properties }).toPromise();
  }

  /**
   * This function is responsible for deleting a lounge
   * @param loungeId
   */
  deleteLounge(loungeId: string) {
    return this._http.delete(this.baseUrl + `/lounges/${loungeId}`).toPromise();
  }

  updateImage(workspaceId: string, elementId: string, image: any, elementPropertyName: string, elementType: string) {
    // PREPARING FORM DATA
    let formData = new FormData();
    formData.append('image', image);
    formData.append('type', elementType);
    formData.append('elementPropertyName', elementPropertyName);

    return this._http.put<any>(this.baseUrl + `/lounges/${workspaceId}/updateImage/${elementId}`, formData).toPromise();
  }
}
