import { HttpClient } from '@angular/common/http';
import { Injectable ,EventEmitter} from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})

export class UserService {

  BASE_API_URL = environment.USER_BASE_API_URL;
  INTEGRATIONS_API_URL = environment.INTEGRATIONS_BASE_API_URL;

  constructor(private _http: HttpClient) { }

  slackDisconnectedEvent: EventEmitter<any> = new EventEmitter();
  slackConnectedEvent: EventEmitter<any> = new EventEmitter();

  /* | ======================================= USER DETAILS ========================================== | */

  /**
   * This function fetches the details of the currently loggedIn user
   */
  getUser(): Observable<any> {
    return this._http.get(this.BASE_API_URL + `/`)
  }

  /**
   * This function fetches the details of user based on the @userId
   * @param userId
   */
  getOtherUser(userId: string): Observable<any> {
    return this._http.get(this.BASE_API_URL + `/${userId}`);
  }

  /**
   * This function fetches the details of the currently loggedIn account
   */
  getAccount() {
    return this._http.get(this.BASE_API_URL + `/account`)
  }

  /**
   * This function fetches the details of the currently loggedIn account
   */
  getOtherAccount(userId: string) {
    return this._http.get(this.BASE_API_URL + `/${userId}/otherAccount`).toPromise()
  }

  /* | ======================================= USER DETAILS ========================================== | */

  /**
   * This function updates the details of currently loggedIn user
   * @param userData
   */
  updateUser(userData: Object) {
    return this._http.put(this.BASE_API_URL + `/`, userData)
      .toPromise();
  }

  /**
   * This function is responsible for updating the user data(only profile_pic)
   * @param workspaceId
   * @param workspaceAvatar
   */
  updateUserProfileImage(fileToUpload: File, workspaceId: string): Observable<any> {

    // PREPARING FORM DATA
    let formData = new FormData();
    formData.append('profileImage', fileToUpload);

    const fileData = {
      _workspace: workspaceId
    }
    formData.append('fileData', JSON.stringify(fileData));

    return this._http.put(this.BASE_API_URL + `/image`, formData);
  }


  /**
   * This function is responsible for updating users' role
   * @param { userId, role }
   * @role - 'admin' or 'member'
   */
  updateUserRole(userId: string, role: string) {

    // Preparing the request body data
    let userData = {
      userId: userId.trim(),
      role: role.trim().toLowerCase()
    }

    // Call the API
    return this._http.put(this.BASE_API_URL + '/update-role', userData)
    .toPromise();
  }

  updateUserHRRole(memberId: string, hr_role: boolean) {
    return this._http.put(this.BASE_API_URL + '/change-hr-role', { memberId, hr_role }).toPromise();
  }

  /**
   * This function updates the password of currently loggedIn user
   * @param userData { password: password }
   */
  changePassword(userData: Object) {
    return this._http.put(this.BASE_API_URL + `/change-password`, userData)
      .toPromise();
  }

  /* | ======================================= USER SKILLS ========================================== | */

  /**
   * This function fetches the skill set array of current loggedIn user
   */
  getUserSkills() {
    return this._http.get(this.BASE_API_URL + `/skills/`);
  }

  /**
   * This function fetches the skill set array of current loggedIn user
   */
  searchSkills(skill: string) {
    return this._http.get(this.BASE_API_URL + `/skills/list`, {
      params: {
        skill: skill.toString().trim()
      }
    }).toPromise();
  }

  /**
   * This function is responsible for adding a new skill to users' current skill set
   * @param skill
   */
  addSkill(skill: string): Observable<any> {
    return this._http.post(this.BASE_API_URL + `/skills/${skill}`, '');
  }

  /**
   * This function is responsible for verifying the slack oAuth
   */
  slackAuth(code: string, user: Object) {
    return this._http.post(this.INTEGRATIONS_API_URL + `/slack/slack-auth`, { code, user }).toPromise();
  }

   /**
   * This function is responsible for verifying the slack oAuth
   */
    teamAuth(teamData: string, user: Object) {
      return this._http.post(this.INTEGRATIONS_API_URL + `/teams/teams-auth`, { teamData, user });
    }

  /**
   * This function is responsible for verifying the slack oAuth
   */
   zapierAuth(userId: Object) {
    return this._http.post(this.INTEGRATIONS_API_URL + `/zapier/auth`, { userId });
  }


 /**
   * This function is responsible for deleting user
   */
  removeUser(userId: string){
    return this._http.delete(this.BASE_API_URL + `/${userId}`).toPromise();;
  }

  /**
   * This function is responsible for deleting user
   */
  transferOwnership(querydata: Object){
    return this._http.put(this.BASE_API_URL +'/transefer-ownership',querydata).toPromise();;
  }


  /**
   * This function is responsible for diconnecting the slack oA
   */
  disconnectSlack(user: Object): any {
    return this._http.delete(this.INTEGRATIONS_API_URL + `/slack/disconnect-slack/${user}`).toPromise();
  }

   /**
   * This function is responsible for diconnecting the teams
   */
  disconnectTeams(user: Object): Observable<any> {
    return this._http.get(this.INTEGRATIONS_API_URL + `/teams/disconnect-team?userId=${user}`);
  }

  /**
   * This function is responsible for adding a new skill to users' current skill set
   * @param skill
   */
  removeSkill(skill: string): Observable<any> {
    return this._http.delete(this.BASE_API_URL + `/skills/${skill}`);
  }

  /* | ======================================= USER SKILLS ========================================== | */


  downloadFile(file: File): Observable<any> {
    return this._http.post(this.BASE_API_URL + `/file/download`, file, { responseType: 'blob' });
  }

  getUserTasks(): Observable<any> {
    return this._http.get<any>(this.BASE_API_URL + `/tasks`);
  }

  getCompletedUserTasks(): Observable<any> {
    return this._http.get<any>(this.BASE_API_URL + `/tasksDone`);
  }

  getRecentUserTasks(postId: string): Observable<any> {
    return this._http.get<any>(this.BASE_API_URL + `/nextTasksDone/${postId}`);
  }

  getUserCalendarPosts(data: any): Observable<any> {
    return this._http.get(this.BASE_API_URL + `/${data.groupId}/user/${data.userId}/calendar/${data.year}/${data.month}`);
  }

  getLikedPostsCount() {
    return this._http.get<any>(this.BASE_API_URL + `/likedPostsCount`);
  }

  getFollowedPostsCount() {
    return this._http.get<any>(this.BASE_API_URL + `/followedPostsCount`);
  }

  /**
   * USER TODAY'S TASKS
   */
  getUserTodayTasks() {
    return this._http.get(this.BASE_API_URL + `/tasks/today`).toPromise();
  }

  /**
   * USER THIS WEEK'S TASKS
   */
  getUserThisWeekTasks() {
    return this._http.get(this.BASE_API_URL + `/tasks/week`).toPromise();
  }

  /**
   * USER NEXT WEEK'S TASKS
   */
  getUserNextWeekTasks() {
    return this._http.get(this.BASE_API_URL + `/tasks/next-week`).toPromise();
  }

  /**
   * USER FUTURE TASKS
   */
  getUserFutureTasks() {
    return this._http.get(this.BASE_API_URL + `/tasks/future`).toPromise();
  }

  /**
   * USER OVERDUE TASK
   */
  getUserOverdueTasks() {
    return this._http.get(this.BASE_API_URL + `/tasks/overdue`).toPromise();
  }

  getWorkloadOverdueTasks(userId: string, groupId: string) {
    return this._http.get(this.BASE_API_URL + `/tasks/workloadOverdue`, {
      params: {
        userId: userId,
        groupId: groupId.trim()
      }
    }).toPromise();
  }

  /**
   * USER TODAY'S EVENTS
   */
  getUserTodayEvents() {
    return this._http.get(this.BASE_API_URL + `/events/today`).toPromise();
  }

  /**
   * USER THIS WEEK'S EVENTS
   */
  getUserThisWeekEvents() {
    return this._http.get(this.BASE_API_URL + `/events/week`).toPromise();
  }

  /**
   * USER GLOBAL FEED
   */
  getUserGlobalFeed(userId?: string){

    if(userId != undefined)
      return this._http.get(this.BASE_API_URL + `/global/feed`, {
        params: {
          userId: userId
        }
      }).toPromise();

    else
      return this._http.get(this.BASE_API_URL + `/global/feed`).toPromise();
  }

  /**
   * GET USER FAVORITE GROUPS
   */
  getUserFavoriteGroups(userId: string){
    return this._http.get(this.BASE_API_URL + `/favorite-groups/${userId}`).toPromise();
  }

  /**
   * GET MOST USED GROUPS
   */
  getRecentGroups(userId: string) {
    return this._http.get(this.BASE_API_URL + `/recent-groups/${userId}`).toPromise();
  }

  /**
   * Increase the visits to the group by the user
   * @param { userId, groupId }
   */
  increaseGroupVisit(userId: string, groupId: string) {

    // Preparing the request body data
    let data = {
      userId: userId.trim(),
      groupId: groupId.trim()
    }

    // Call the API
    return this._http.put(this.BASE_API_URL + '/increment-group-visit', data)
    .toPromise();
  }

  /**
   * Save a group as favorite for teh user
   */
  saveFavoriteGroup(userId: string, groupId: string, isFavoriteGroup: boolean) {
    return this._http.put(this.BASE_API_URL + '/add-favorite-group', {
      userId: userId,
      groupId: groupId,
      isFavoriteGroup: isFavoriteGroup
    })
    .toPromise();
  }

  saveIconSidebarByDefault(userId: string, iconsSidebar: boolean) {
    return this._http.put(this.BASE_API_URL + '/default-icons-sidebar', {
      iconsSidebar: iconsSidebar,
      userId: userId
    })
    .toPromise();
  }

  getOutOfTheOfficeDays(userId: string) {
    return this._http.get(this.BASE_API_URL + `/${userId}/out-of-office-days`)
      .toPromise();
  }

  saveOutOfTheOfficeDays(userId: string, days: any, action: string) {
    return this._http.put(this.BASE_API_URL + `/${userId}/out-of-office-days`, {
      days: days,
      action: action
    }).toPromise();
  }

  slackDisconnected(){
    return this.slackDisconnectedEvent;
  }

  slackConnected(){
    return this.slackConnectedEvent;
  }

  /**
   * This method is responsible for saving the widgets to display in the global dashboard page
   * @param userId
   * @param selectedWidgets
   * @returns
   */
  saveSelectedWidgets(userId: string, selectedWidgets: string[]) {
    return this._http.put<any>(`${this.BASE_API_URL}/${userId}/saveSelectedWidgets`, {selectedWidgets: selectedWidgets}).toPromise();
  }

  showAllocationWidget(userId: string, settingsData: any) {
    return this._http.put(this.BASE_API_URL + `/${userId}/showAllocationWidget`,{settingsData}).toPromise();
  }

  /**
   * This function is used to save a custom field value
   * @param userId
   */
  saveCustomField(userId: string, customFieldName: string, customFieldValue: string) {
    // Call the HTTP Request
    return this._http.put(this.BASE_API_URL + `/${userId}/customField`, {
      customFieldName: customFieldName,
      customFieldValue: customFieldValue
    }).toPromise();
  }

  saveCustomFieldsFromLDAP(userId: string, workspaceId: string, customFieldsMap: any) {
    // Call the HTTP Request
    return this._http.put(this.BASE_API_URL + `/${userId}/saveCustomFieldsFromLDAP`, {
      workspaceId: workspaceId,
      customFieldsMap: customFieldsMap
    }).toPromise();
  }

  saveLocale(localeCode: string) {
    return this._http.put(this.BASE_API_URL + `/locale`, {
      localeCode: localeCode
    }).toPromise();
  }

  getUserWorkspaces(userId: string) {
    return this._http.get(this.BASE_API_URL + `/${userId}/userWorkspaces`).toPromise();
  }

  savePayrollCustomField(userId: string, customFieldId: string, customFieldValue: string) {
    // Call the HTTP Request
    return this._http.put(this.BASE_API_URL + `/${userId}/payrollCustomField`, {
      customFieldId: customFieldId,
      customFieldValue: customFieldValue
    }).toPromise();
  }

  savePayrollVariable(userId: string, customFieldId: string, customFieldValue: string) {
    // Call the HTTP Request
    return this._http.put(this.BASE_API_URL + `/${userId}/payrollVariable`, {
      customFieldId: customFieldId,
      customFieldValue: customFieldValue
    }).toPromise();
  }
}
