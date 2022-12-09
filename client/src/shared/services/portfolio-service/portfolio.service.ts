import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {

  constructor(private _http: HttpClient) { }

  baseURL = environment.GROUPS_BASE_API_URL + '/portfolio';

  /**
   * This function create a new normal portfolio and makes the POST request
   * @param portfolioName
   */
  createPortfolio(portfolioName: string) {
    return this._http.post(this.baseURL + `/`, {
      portfolio_name: portfolioName
    }).toPromise();
  }

  /**
   * This function is responsible for fetching the list of all portfolios for which a user is a part of
   * @param workspaceId
   */
  getUserPortfolios(){
    return this._http.get(this.baseURL + `/`, {}).toPromise();
  }

  /**
   * This function gets a portfolio and makes the GET request
   * @param portfolioId
   */
  getPortfolio(portfolioId: string) {
    return this._http.get(this.baseURL + `/${portfolioId}`).toPromise();
  }

  /**
   * This function updates a portfolio and makes the PUT request
   * @param portfolioId
   * @param portfolioProperties
   */
  updatePortfolioProperties(portfolioId: string, portfolioProperties: any) {
    return this._http.put(this.baseURL + `/${portfolioId}`, portfolioProperties).toPromise();
  }

  /**
   * This function updates the portfolio quill data
   * @param portfolioId
   * @param portfolioForm
   */
  updatePortfolioContent(portfolioId: string, portfolioForm: any) {
    return this._http.put(this.baseURL + `/${portfolioId}/content`, portfolioForm).toPromise();
  }

  /**
   * This function adds a group to a portfolio
   * @param portfolioId
   * @param groupId
   */
  addGroupToPortfolio(portfolioId: string, groupId: string) {
    return this._http.put(this.baseURL + `/${portfolioId}/add-group`, { groupId }).toPromise();
  }

  /**
   * This function removes a Manager to a portfolio
   * @param portfolioId
   * @param assigneeId
   */
  removeManagerToPortfolio(portfolioId: string, assigneeId: string) {
    return this._http.put(this.baseURL + `/${portfolioId}/remove-manager`, { assigneeId }).toPromise();
  }

  /**
   * This function adds a Manager to a portfolio
   * @param portfolioId
   * @param assigneeId
   */
  addManagerToPortfolio(portfolioId: string, assigneeId: string) {
    return this._http.put(this.baseURL + `/${portfolioId}/add-manager`, { assigneeId }).toPromise();
  }

  /**
   * This function removes a group to a portfolio
   * @param portfolioId
   * @param groupId
   */
  removeGroupToPortfolio(portfolioId: string, groupId: string) {
    return this._http.put(this.baseURL + `/${portfolioId}/remove-group`, { groupId }).toPromise();
  }

  /**
   * This function delete a portfolio and makes the DELETE request
   * @param portfolioId
   */
  deletePortfolio(portfolioId: string) {
    return this._http.delete(this.baseURL + `/${portfolioId}`).toPromise();
  }

  /**
   * This function is responsible for updating the group avatar
   * @param portfolioId
   * @param fileToUpload
   * @param workspaceId
   */
  updatePortfolioImage(portfolioId: any, fileToUpload: File, workspaceId: string, isBackbroundImage: boolean = false) {

    // PREPARING FORM DATA
    let formData = new FormData();
    formData.append('portfolioAvatar', fileToUpload);

    const fileData = {
      _workspace: workspaceId,
      isBackbroundImage: isBackbroundImage
    }
    formData.append('fileData', JSON.stringify(fileData));
    return this._http.put(this.baseURL + `/${portfolioId}/image`, formData).toPromise();
  }

  /**
   * This function is responsible for fetching all group members
   * @param portfolioId
   */
  getAllPortfolioGroupMembers(portfolioId: string) {
    return this._http.get(this.baseURL + `/${portfolioId}/groups-members`, {}).toPromise()
  }

  /**
   * This function is used to obtain all the tasks of a group of users in specific dates
   */
  getPortfolioGroupTasksBetweenDays(portfolioId: any, startDate: any, endDate: any) {
    return this._http.get(this.baseURL + `/${portfolioId}/tasks-between-days`, {
      params: {
        startDate: startDate,
        endDate: endDate
      }
    }).toPromise()
  }

  /**
   * This function is responsible for fetching all the project columns present in a portfolio
   * @param portfolioId
   */
  getAllPortfolioProjectColumns(portfolioId: string) {
    return this._http.get(this.baseURL + `/${portfolioId}/projects-portfolio`, {}).toPromise()
  }

  /**
   * Portfolio's tasks
   */
  getPortfolioTasks(portfolioId: string, numDays: number) {
    return this._http.get(this.baseURL + `/${portfolioId}/tasks-in-period`, {
      params: {
        numDays: numDays.toString().trim()
      }
    }).toPromise();
  }

  getAllPortfolioTasksStats(portfolioId: string) {
    return this._http.get(this.baseURL + `/${portfolioId}/all-tasks-stats`, {}).toPromise();
  }
}
