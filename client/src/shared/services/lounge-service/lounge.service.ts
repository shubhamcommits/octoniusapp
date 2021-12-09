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

  /**
   * This function is responsible for adding a story to the workspace
   * @param story
   */
  addStory(story: any) {
    return this._http.post(this.baseUrl + `/stories`, { story }).toPromise();
  }

  /**
   * This function is responsible for fetching all the stories & events present in a workspace
   * @param workspaceId
   * @param loungeId
   */
  getAllStories(workspaceId: string, loungeId?: string) {
    return this._http.get(this.baseUrl + `/stories/all`, {
      params: {
        workspaceId: workspaceId,
        loungeId: loungeId || ''
      }
    }).toPromise()
  }

  /**
   * This function is responsible to renaming a story
   * @param storyId
   * @param newName
   */
  editStory(storyId: string, properties: any) {
    return this._http.put(this.baseUrl + `/stories/${storyId}`, { properties }).toPromise();
  }

  getStory(storyId: string) {
    return this._http.get(this.baseUrl + `/stories/one/${storyId}`).toPromise();
  }

  deleteStory(storyId: string) {
    return this._http.delete(this.baseUrl + `/stories/${storyId}`).toPromise();
  }

  confirmAssistance(storyId: string) {
    return this._http.put(this.baseUrl + `/stories/${storyId}/confirmEvent`, {}).toPromise();
  }

  rejectAssistance(storyId: string) {
    return this._http.put(this.baseUrl + `/stories/${storyId}/rejectEvent`, {}).toPromise();
  }

  doubtAssistance(storyId: string) {
    return this._http.put(this.baseUrl + `/stories/${storyId}/doubtEvent`, {}).toPromise();
  }

  likeStory(storyId: string) {
    return this._http.put(this.baseUrl + `/stories/${storyId}/like`, {}).toPromise();
  }

  unlikeStory(storyId: string) {
    return this._http.put(this.baseUrl + `/stories/${storyId}/unlike`, {}).toPromise();
  }

  followStory(storyId: string) {
    return this._http.put(this.baseUrl + `/stories/${storyId}/follow`, {}).toPromise();
  }

  unfollowStory(storyId: string) {
    return this._http.put(this.baseUrl + `/stories/${storyId}/unfollow`, {}).toPromise();
  }

  getRecentStories(workspaceId: string) {
    return this._http.get(this.baseUrl + `/stories/${workspaceId}/recent`).toPromise();
  }

  addReader(storyId: string) {
    return this._http.put(this.baseUrl + `/stories/${storyId}/addReader`, {}).toPromise();
  }
}
