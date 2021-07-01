import { Component, OnInit, Injector } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { ActivatedRoute } from '@angular/router';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { MatDialog } from '@angular/material/dialog';
import { GroupBarDialogComponent } from './group-bar-dialog/group-bar-dialog.component';

@Component({
  selector: 'app-group-admin',
  templateUrl: './group-admin.component.html',
  styleUrls: ['./group-admin.component.scss']
})
export class GroupAdminComponent implements OnInit {

  // User Data Object
  userData: any;

  // PUBLIC FUNCTIONS
  private publicFunctions = new PublicFunctions(this.injector);

  // Fetch groupId from router snapshot
  groupId = this.router.snapshot.queryParamMap.get('group');

  // Current Group Data
  groupData: any = {}

  // Current Workspace Data
  workspaceData: any = {};

  enabledRights: boolean;

  enabledProjectType: boolean;

  enabledShuttleType: boolean;

  groupSections: any = [];

  constructor(
    private injector: Injector,
    private utilityService: UtilityService,
    public dialog: MatDialog,
    private router: ActivatedRoute) { }

  async ngOnInit() {

    // Fetch current group from the service
    this.groupData = await this.publicFunctions.getCurrentGroup();
    this.enabledRights = this.groupData.enabled_rights;
    this.enabledProjectType = this.groupData.project_type;

    // Fetch Current User
    this.userData = await this.publicFunctions.getCurrentUser();

    // Fetch Current Workspace
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    this.groupSections = await this.publicFunctions.getAllColumns(this.groupId);
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object){
    return !(JSON.stringify(object) === JSON.stringify({}))
  }

  addNewUser(member: any){
    this.onAddNewUser(this.groupId, member)

    if(member.role === 'member')
      this.groupData._members.push(member)

    else
      this.groupData._admins.push(member)

    this.publicFunctions.sendUpdatesToGroupData(this.groupData)
  }

  /**
   * This function is responsible for adding a new user to the group
   * @param groupId
   * @param { _id, first_name, email } member
   */
  onAddNewUser(groupId: string, member: any){

    // Utility Service
    let utilityService = this.injector.get(UtilityService)

    // Group Service
    let groupService = this.injector.get(GroupService);

    // Add a new member to group
    utilityService.asyncNotification('Please wait we are adding the new user to your group...',
    new Promise((resolve, reject)=>{
      groupService.addNewUserToGroup(groupId, member)
      .then(()=> resolve(utilityService.resolveAsyncPromise(`${member.first_name} added to your group!`)))
      .catch(() => reject(utilityService.rejectAsyncPromise(`Unable to add ${member.first_name} to your group, please try again!`)))
    }))
  }

  saveSettings(selected) {

    // Utility Service
    let utilityService = this.injector.get(UtilityService);

    // Group Service
    let groupService = this.injector.get(GroupService);

    if (selected.source.name === 'enabled_rights') {
      this.enabledRights = selected.checked;
      this.groupData.enabled_rights = selected.checked;
    }

    if (selected.source.name === 'enabled_project_type') {
      this.enabledProjectType = selected.checked;
      this.groupData.project_type = selected.checked;
    }

    if (selected.source.name === 'enabled_shuttle_type') {
      this.enabledShuttleType = selected.checked;
      this.groupData.shuttle_type = selected.checked;
    }

    utilityService.asyncNotification('Please wait we are saving the new setting...',
      new Promise((resolve, reject)=>{
        groupService.saveSettings(this.groupId, selected.source.name, selected.checked)
        .then(()=> {
          this.publicFunctions.sendUpdatesToGroupData(this.groupData);
          resolve(utilityService.resolveAsyncPromise('Settings saved to your group!'));
        })
        .catch(() => reject(utilityService.rejectAsyncPromise('Unable to save the settings to your group, please try again!')))
      }));
  }

  selectShuttleSection(column: any) {

    // Utility Service
    let utilityService = this.injector.get(UtilityService);

    // Group Service
    let groupService = this.injector.get(GroupService);

    utilityService.asyncNotification('Please wait we are saving the new setting...',
      new Promise((resolve, reject)=>{
        groupService.selectShuttleSection(this.groupId, column)
        .then((res)=> {
          this.publicFunctions.sendUpdatesToGroupData(res['group']);
          resolve(utilityService.resolveAsyncPromise('Settings saved to your group!'));
        })
        .catch(() => reject(utilityService.rejectAsyncPromise('Unable to save the settings to your group, please try again!')))
      }));
  }

  openBarModal(groupId){
    const dialogRef = this.dialog.open(GroupBarDialogComponent, {
      width: '100%',
      height: '100%',
      disableClose: true,
      data: { groupData: this.groupData }
    });
    const sub = dialogRef.componentInstance.closeEvent.subscribe((data) => {
    });
    dialogRef.afterClosed().subscribe(result => {
      sub.unsubscribe();
    });
  }
}
