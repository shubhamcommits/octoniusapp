import { Component, OnInit } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { SubSink } from 'subsink';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin-header',
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.scss']
})
export class AdminHeaderComponent implements OnInit {

  constructor(
    private utilityService: UtilityService,
    private workspaceService: WorkspaceService,
    private storageService: StorageService) {
  }

  // USER DATA
  userData: any;

  // BASE URL OF THE APPLICATION
  baseUrl = environment.BASE_URL;

  // WORKSPACE DATA
  workspaceData: any;

  // UNSUBSCRIBE THE DATA
  private subSink = new SubSink();

  async ngOnInit() {

    // FETCH THE USER DETAILS EITHER FROM SHARED SERVICE OR FROM STORED LOCAL DATA
    this.userData = (JSON.stringify(await this.getUserDetails()) === JSON.stringify({}))
      ? (this.storageService.getLocalData('userData'))
      : await this.getUserDetails();

    // INITIALISE THE WORKSPACE DATA AND FETCH DETAILS FROM THE SERVER
    if (JSON.stringify(this.userData) != JSON.stringify({}))
      this.workspaceData = await this.getWorkspaceDetails(this.userData['_workspace']);

    // SENDING THE UPDATE THROUGH SERVICE TO UPDATE THE WORKSPACE DETAILS AT ALL COMPONENTS
    if (this.workspaceData) {
      this.utilityService.updateWorkplaceData(this.workspaceData);
      this.storageService.setLocalData('workspaceData', JSON.stringify(this.workspaceData))
    }

    console.log(this.storageService.getLocalData('workspaceData'));

  }

  /**
   * This function is responsible for fetching the user details from the shared service
   */
  async getUserDetails() {
    return new Promise((resolve) => {
      this.subSink.add(this.utilityService.currentUserData.subscribe((res) => {
        resolve(res);
      }))
    })
  }

  /**
   * This function is resposible for fetching the latest details about the current workspace from the server
   * @param workspaceId 
   */
  async getWorkspaceDetails(workspaceId: string) {
    try {
      return new Promise((resolve, reject) => {
        this.subSink.add(this.workspaceService.getWorkspace(workspaceId)
          .subscribe((res) => {
            console.log(res);
            resolve(res['workspace']);
          }, (err) => {
            console.log('Error occured while fetching the workspace details!', err);
            this.utilityService.errorNotification('Error occured while fetching the workspace details, please try again!');
            reject({});
          }))
      })
    } catch (err) {
      console.log('There\'s some unexpected error occured, please try again!', err);
      this.utilityService.errorNotification('There\'s some unexpected error occured, please try again!');
    }
  }

  /**
    * This function opens up the task content in a new modal, and takes #content in the ng-template inside HTML layout
    * @param content 
    */
   async openWorkspaceDetails(content) {
    this.utilityService.openModal(content, {
      size: 'xl',
      centered: true
    });
  }

  /**
   * This function unsubscribes the data from the observables
   */
  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

}

