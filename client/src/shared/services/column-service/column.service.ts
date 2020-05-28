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
  initColumns(groupId: string) {
    const group = {
      groupId: groupId
    }
    return this._http.post(this.baseUrl + `/columns/init/`, group)
    .toPromise()
  }

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
   * @param groupId 
   * @param oldColumnName 
   * @param newColumnName 
   */
  editColumnName(groupId: string, oldColumnName: string, newColumnName: string) {
    const group = {
      groupId: groupId,
      oldColumnName: oldColumnName,
      newColumnName: newColumnName
    }
    return this._http.put(this.baseUrl + `/columns/edit/name`, group)
    .toPromise()
  }

  /**
   * This function is responsible for deleting a column
   * @param groupId 
   * @param columnName 
   */
  deleteColumn(groupId: string, columnName: string) {
    const group = {
      groupId: groupId,
      columnName: columnName
    }
    return this._http.put(this.baseUrl + `/columns/delete`, group)
    .toPromise()
  }

  getOneColumn(groupId, columnName) {
    return this._http.get(this.baseUrl + `/column/${groupId}/${columnName}`);
  }

  editColumnNumber(groupId, columnName, numberOfTasks) {
    const group = {
      groupId: groupId,
      columnName: columnName,
      numberOfTasks: numberOfTasks
    };
    return this._http.put(this.baseUrl + `/columns/edit/number`, group);
  }

  addColumnTask(groupId, columnName) {
    const group = {
      groupId: groupId,
      columnName: columnName
    };
    return this._http.put(this.baseUrl + `/columns/edit/inc`, group);
  }

  deleteColumnTask(groupId, columnName) {
    const group = {
      groupId: groupId,
      columnName: columnName
    };
    return this._http.put(this.baseUrl + `/columns/edit/dec`, group);
  }

}
