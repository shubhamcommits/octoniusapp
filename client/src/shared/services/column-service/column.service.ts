import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { DateTime } from 'luxon';

@Injectable({
  providedIn: 'root'
})
export class ColumnService {

  constructor(private _http: HttpClient) { }

  baseUrl = environment.GROUPS_BASE_API_URL;
  basePostsUrl = environment.POST_BASE_API_URL;

  /**
   * This function is responsible for fetching an specific section by id
   * @param sectionId
   */
   getSection(sectionId: string) {
    return this._http.get(this.baseUrl + `/columns/${sectionId}`).toPromise();
  }

  /**
   * This function is responsible for fetching all the columns present in a board
   * @param groupId
   */
  getAllColumns(groupId: string) {
    return this._http.get(this.baseUrl + `/columns/${groupId}/all`, {
      params:{
        groupId: groupId
      }
    }).toPromise()
  }

  /**
   * This function is responsible for fetching all the archived columns present in a board
   * @param groupId
   */
  getAllArchivedColumns(groupId: string) {
    return this._http.get(this.baseUrl + `/columns/${groupId}/archived`, {
      params:{
        groupId: groupId
      }
    }).toPromise()
  }

  /**
   * This function is responsible for fetching all the columns present in a board
   * @param groupId
   */
  getGroupProjectColumns(groupId: string) {
    return this._http.get(this.baseUrl + `/columns/${groupId}/projects`, {
      params:{
        groupId: groupId
      }
    }).toPromise()
  }

  /**
   * This function is responsible for fetching all the columns present in a board
   * @param groupId
   */
  getAllProjectColumns(workspaceId: string, userId: string) {
    return this._http.get(this.baseUrl + `/columns/${workspaceId}/projects`, {
      params:{
        workspaceId: workspaceId,
        userId: userId
      }
    }).toPromise()
  }

  /**
   * This function is responsible for fetching all the columns present in a board filtering by groups
   * @param workspaceId
   * @param filteringGroups
   * @returns
   */
  getGroupProjectColumnsByGroups(workspaceId: string, filteringGroups: []) {
    return this._http.get(this.baseUrl + `/columns/${workspaceId}/projectsByGroups`, {
      params:{
        workspaceId: workspaceId,
        filteringGroups: filteringGroups
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
    return this._http.put(this.baseUrl + `/columns/${columnId}/edit/name`, column)
    .toPromise()
  }

  /**
   * This function is responsible for deleting a column
   * @param columnId
   */
  deleteColumn(columnId: string) {
    return this._http.delete(this.baseUrl + `/columns/${columnId}/delete`).toPromise();
  }

  saveCustomFieldsToShow(columnId: string, customFieldsToShow: any[]) {
    const column = {
      columnId: columnId,
      customFieldsToShow: customFieldsToShow
    };

    return this._http.put(this.baseUrl + `/columns/${columnId}/customFieldsToShow`, column).toPromise();
  }

  changeColumnProjectType(columnId: string, projectType: boolean) {
    const column = {
      columnId: columnId,
      projectType: projectType
    };

    return this._http.put(this.baseUrl + `/columns/${columnId}/changeColumnProjectType`, column).toPromise();
  }

  saveColumnProjectDates(columnId: string, startDate: any, dueDate: any) {
    const column = {
      columnId: columnId,
      startDate: DateTime.fromISO(startDate).toISODate(),
      dueDate: DateTime.fromISO(dueDate).toISODate()
    };

    return this._http.put(this.baseUrl + `/columns/${columnId}/saveColumnProjectDates`, column).toPromise();
  }

  saveAmountBudget(columnId: string, amountPlanned: Number, currency?: string) {
    const column = {
      columnId: columnId,
      amountPlanned: amountPlanned,
      currency: currency
    };
    return this._http.put(this.baseUrl + `/columns/${columnId}/saveAmountBudget`, column).toPromise();
  }

  addBudgetExpense(columnId: string, expense: any) {
    const column = {
      expense: expense
    };
    return this._http.put(this.baseUrl + `/columns/${columnId}/addBudgetExpense`, column).toPromise();
  }

  updateBudgetExpense(columnId: string, expense: any) {
    const column = {
      expense: expense
    };
    return this._http.put(this.baseUrl + `/columns/${columnId}/updateBudgetExpense`, column).toPromise();
  }

  deleteBudgetExpense(columnId: string, expenseId: string) {
    const column = {
      columnId: columnId,
      expenseId: expenseId
    };
    return this._http.put(this.baseUrl + `/columns/${columnId}/deleteBudgetExpense`, column).toPromise();
  }

  /**
   * Saves the order of the sections in the board views
   * @param columns
   * @returns
   */
  updateColumnsPosition(columns: any) {
    return this._http.put<any>(this.baseUrl + `/columns/${null}/updateColumnsPosition`, {columns: columns}).toPromise();
  }

  displayCustomFieldInColumn(columnId: string, showInColumn: boolean, customFieldName: string) {
    return this._http.put<any>(this.baseUrl + `/columns/${columnId}/setDisplayCustomFieldInColumn`, {columnId, showInColumn, customFieldName}).toPromise();
  }

  archiveColumn(sectionId: string) {
    return this._http.put<any>(this.baseUrl + `/columns/${sectionId}/archive`, { sectionId }).toPromise();
  }

  /**
   *
   * STARTING THE BLOCK OF METHODS TO UPDATE THE RIGHTS OF AN ITEM
   * ITEM = post/section/file/folder
   *
   */
  selectPermissionRight(permissionId: string, sectionId: string, right: string) {
    // Call the HTTP Request
    return this._http.put(this.basePostsUrl + `/section/permissions/${sectionId}/selectPermissionRight`, { right, permissionId }).toPromise();
  }

  removePermission(permissionId: string, sectionId: string) {
    // Call the HTTP Request
    return this._http.put(this.basePostsUrl + `/section/permissions/${sectionId}/removePermission`, { permissionId }).toPromise();
  }

  addTagToPermission(permissionId: string, sectionId: string, tag: string) {
    // Call the HTTP Request
    return this._http.put(this.basePostsUrl + `/section/permissions/${sectionId}/addTagToPermission`, { permissionId, tag }).toPromise();
  }

  removePermissionTag(permissionId: string, sectionId: string, tag: string) {
    // Call the HTTP Request
    return this._http.put(this.basePostsUrl + `/section/permissions/${sectionId}/removePermissionTag`, { permissionId, tag }).toPromise();
  }

  addMemberToPermission(sectionId: string, permissionId: string, member: any) {
    // Call the HTTP Request
    return this._http.put(this.basePostsUrl + `/section/permissions/${sectionId}/addMemberToPermission`, { permissionId, member }).toPromise();
  }

  removeMemberFromPermission(sectionId: string, permissionId: string, memberId: string) {
    // Call the HTTP Request
    return this._http.put(this.basePostsUrl + `/section/permissions/${sectionId}/removeMemberFromPermission`, { permissionId, memberId }).toPromise();
  }

  getSectionTimeTrackingCost(sectionId: string) {
    return this._http.get(this.baseUrl + `/columns/${sectionId}/sectionTimeTrackingCost`, {}).toPromise()
  }
  /**
   *
   * ENDS THE BLOCK OF METHODS TO UPDATE THE RIGHTS OF AN ITEM
   * ITEM = post/section/file/folder
   *
   */
}
