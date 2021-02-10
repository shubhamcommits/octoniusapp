import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ColumnService {

  constructor(private _http: HttpClient) { }

  baseUrl = environment.GROUPS_BASE_API_URL;

  /**
   * This function is responsible for initializing the columns
   * @param groupId
   */
  /*
  initColumns(groupId: string) {
    const group = {
      groupId: groupId
    }
    return this._http.post(this.baseUrl + `/columns/init/`, group)
    .toPromise()
  }
  */

  /**
   * This function is responsible for fetching all the columns present in a board
   * @param groupId
   */
  getAllColumns(groupId: string) {
    return this._http.get(this.baseUrl + `/columns/all`, {
      params:{
        groupId: groupId
      }
    }).toPromise()
  }

  /**
   * This function is responsible for adding a column to the board
   * @param groupId
   * @param columnName
   */
  addColumn(groupId: string, columnName: string) {
    const group = {
      groupId: groupId,
      columnName: columnName
    }
    return this._http.post(this.baseUrl + `/columns/`, group)
    .toPromise()
  }

  /**
   * This function is responsible to renaming a column
   * @param columnId
   * @param oldColumnName
   * @param newColumnName
   */
  editColumnName(columnId: string, newColumnName: string) {
    const column = {
      columnId: columnId,
      newColumnName: newColumnName
    }
    return this._http.put(this.baseUrl + `/columns/edit/name`, column)
    .toPromise()
  }

  /**
   * This function is responsible for deleting a column
   * @param columnId
   */
  deleteColumn(columnId: string) {
    const column = {
      columnId: columnId
    }
    return this._http.put(this.baseUrl + `/columns/delete`, column)
    .toPromise()
  }

  saveCustomFieldsToShow(columnId: string, customFieldsToShow: any[]) {
    const column = {
      columnId: columnId,
      customFieldsToShow: customFieldsToShow
    };

    return this._http.put(this.baseUrl + `/columns/customFieldsToShow`, column).toPromise();
  }

}
