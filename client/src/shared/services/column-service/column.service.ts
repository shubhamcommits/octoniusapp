import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import moment from 'moment/moment';

@Injectable({
  providedIn: 'root'
})
export class ColumnService {

  constructor(private _http: HttpClient) { }

  baseUrl = environment.GROUPS_BASE_API_URL;

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
   * This function is responsible for fetching all the columns present in a board
   * @param groupId
   */
  getGroupProjectColumns(groupId: string) {
    return this._http.get(this.baseUrl + `/columns/projects`, {
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
    return this._http.get(this.baseUrl + `/columns/projects`, {
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
    return this._http.get(this.baseUrl + `/columns/projectsByGroups`, {
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

  changeColumnProjectType(columnId: string, projectType: boolean) {
    const column = {
      columnId: columnId,
      projectType: projectType
    };

    return this._http.put(this.baseUrl + `/columns/changeColumnProjectType`, column).toPromise();
  }

  saveColumnProjectDates(columnId: string, startDate: any, dueDate: any) {
    const column = {
      columnId: columnId,
      startDate: moment(startDate).format('YYYY-MM-DD'),
      dueDate: moment(dueDate).format('YYYY-MM-DD')
    };

    return this._http.put(this.baseUrl + `/columns/saveColumnProjectDates`, column).toPromise();
  }

  saveAmountBudget(columnId: string, amountPlanned: Number, currency?: string) {
    const column = {
      columnId: columnId,
      amountPlanned: amountPlanned,
      currency: currency
    };
    return this._http.put(this.baseUrl + `/columns/saveAmountBudget`, column).toPromise();
  }

  addBudgetExpense(columnId: string, expense: any) {
    const column = {
      columnId: columnId,
      expense: expense
    };
    return this._http.put(this.baseUrl + `/columns/addBudgetExpense`, column).toPromise();
  }

  updateBudgetExpense(columnId: string, expense: any) {
    const column = {
      columnId: columnId,
      expense: expense
    };
    return this._http.put(this.baseUrl + `/columns/updateBudgetExpense`, column).toPromise();
  }

  deleteBudgetExpense(columnId: string, expenseId: string) {
    const column = {
      columnId: columnId,
      expenseId: expenseId
    };
    return this._http.put(this.baseUrl + `/columns/deleteBudgetExpense`, column).toPromise();
  }
}
