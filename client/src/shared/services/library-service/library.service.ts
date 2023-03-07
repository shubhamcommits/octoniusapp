import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {

  baseUrl = environment.GROUPS_BASE_API_URL;

  constructor(private _http: HttpClient) { }

  /**
   * This function is responsible for fetching an specific collection by id
   * @param collectionId
   */
  getCollection(collectionId: string) {
    return this._http.get(this.baseUrl + `/library/collection/${collectionId}`).toPromise();
  }

  /**
   * This function is responsible for fetching an specific collection by the page id
   * @param pageId
   */
  getCollectionByPage(pageId: string) {
    return this._http.get(this.baseUrl + `/library/collection/${pageId}/by-page`).toPromise();
  }

  /**
   * This function is responsible for fetching all collections by group
   * @param groupId
   */
  getCollectionsByGroup(groupId: string) {
    return this._http.get(this.baseUrl + `/library/collection/${groupId}/by-group`).toPromise();
  }

  /**
   * This function is responsible for adding a collection to the group
   * @param groupId
   */
  createCollection(collection: any) {
    return this._http.post(this.baseUrl + `/library/create-collection`, { collection }).toPromise();
  }

  /**
   * This function is responsible to renaming a collection
   * @param collectionId
   * @param newName
   */
  editCollection(collectionId: string, properties: any) {
    return this._http.put(this.baseUrl + `/library/collection/${collectionId}`, { properties }).toPromise();
  }

  /**
   * This function is responsible for deleting a collection
   * @param collectionId
   */
  deleteCollection(collectionId: string, workspaceId: string) {
    return this._http.delete(this.baseUrl + `/library/collection/${workspaceId}/${collectionId}`).toPromise();
  }

  /**
   * This function updates the portfolio quill data
   * @param portfolioId
   * @param portfolioForm
   */
  editCollectionContent(collectionId: string, portfolioForm: any) {
    return this._http.put(this.baseUrl + `/library/collection/${collectionId}/content`, portfolioForm).toPromise();
  }

  updateCollectionImage(workspaceId: string, collectionId: string, image: File) {
    let formData = new FormData();
    formData.append('image', image);
    return this._http.put<any>(this.baseUrl + `/library/collection/${collectionId}/updateCollectionImage/${workspaceId}`, formData).toPromise();
  }

  /**
   * This function is responsible for uploding a file to the collection
   * @param fileData
   */
  addCollectionFile(collectionId: string, workspaceId: string, fileData: any, fileToUpload: File) {

    // PREPARING FORM DATA
    let formData = new FormData();

    // Adding File Data
    formData.append('fileData', JSON.stringify(fileData));

    // Appending file
    formData.append('file', fileToUpload, fileToUpload['name']);

    return this._http.post(this.baseUrl + `/library/collection/${collectionId}/files/${workspaceId}`, formData).toPromise();
  }

  deleteCollectionFile(fileId: string, workspaceId: string) {
    return this._http.put(this.baseUrl + `/library/collection/${fileId}/remove-file/${workspaceId}`, {}).toPromise();
  }

  createPage(collectionId: string, parentPageId: string, newPageName: string) {
    return this._http.post(this.baseUrl + `/library/page/${collectionId}`, {
      parentPageId: parentPageId,
      newPageName: newPageName
    }).toPromise();
  }

  /**
   * This function is responsible for deleting a page
   * @param pageId
   */
  deletePage(pageId: string, workspaceId: string) {
    return this._http.delete(this.baseUrl + `/library/page/${pageId}/${workspaceId}`).toPromise();
  }

  /**
   * This function is responsible for fetching all pages by collection
   * @param collectionId
   */
   getPageByCollection(collectionId: string) {
    return this._http.get(this.baseUrl + `/library/page/${collectionId}/by-collection`).toPromise();
  }

  /**
   * This function is responsible for fetching all pages by page
   * @param pageId
   */
   getPageByParent(pageId: string) {
    return this._http.get(this.baseUrl + `/library/page/${pageId}/by-page`).toPromise();
  }

  /**
   * This function is responsible to renaming a collection
   * @param pageId
   * @param newName
   */
  editPage(pageId: string, properties: any) {
    return this._http.put(this.baseUrl + `/library/page/${pageId}`, { properties }).toPromise();
  }

  /**
   * This function is responsible for fetching an specific page by id
   * @param pageId
   */
  getPage(pageId: string) {
    return this._http.get(this.baseUrl + `/library/page/${pageId}`).toPromise();
  }

  likePage(pageId: string) {
    return this._http.put(this.baseUrl + `/library/page/${pageId}/like`, {}).toPromise();
  }

  unlikePage(pageId: string) {
    return this._http.put(this.baseUrl + `/library/page/${pageId}/unlike`, {}).toPromise();
  }

  /**
   * This function is responsible for uploding a file to the group
   * @param fileData
   */
  addPageFile(pageId: string, workspaceId: string, collectionId: string, fileData: any, fileToUpload: File) {

    // PREPARING FORM DATA
    let formData = new FormData();

    // Adding File Data
    formData.append('fileData', JSON.stringify(fileData));

    // Appending file
    formData.append('file', fileToUpload, fileToUpload['name']);

    return this._http.post(this.baseUrl + `/library/page/${pageId}/files/${workspaceId}/${collectionId}`, formData).toPromise();
  }

  removePageFile(fileId: string, workspaceId: string) {
    return this._http.put(this.baseUrl + `/library/page/${fileId}/remove-file/${workspaceId}`, {}).toPromise();
  }

  getGroupByCollection(collectionId: string) {
    return this._http.get(this.baseUrl + `/library/collection/${collectionId}/group-by-collection`).toPromise();
  }

  getGroupByPage(pageId: string) {
    return this._http.get(this.baseUrl + `/library/page/${pageId}/group-by-page`).toPromise();
  }

  getUserConfluenceSpaces(workspaceId: string) {
    return this._http.get(this.baseUrl + `/library/collection/${workspaceId}/confluence-spaces`).toPromise();
  }

  exportConfluenceSpaces(spacesToExport : any, workspaceId: string, groupId: string) {
    let formData = new FormData();
    formData.append('spacesToExport', spacesToExport);
    return this._http.post(this.baseUrl + `/library/collection/${workspaceId}/export-spaces/${groupId}`, formData).toPromise();
  }

  /**
   * This function is responsible searching pages
   * @param groupId
   * @param query
   * @param workspaceId
   */
  searchPages(groupId: string, query: any, workspaceId: string) {
    return this._http.get(this.baseUrl + `/library/page/${workspaceId}/search`, {
      params: {
        groupId: groupId,
        query: query
      }
    }).toPromise();
  }
}
