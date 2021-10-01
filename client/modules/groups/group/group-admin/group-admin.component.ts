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

  enabledRights: boolean = false;

  enabledProjectType: boolean = false;

  enabledShuttleType: boolean = false;

  // Campaign Status
  enabledCampaign: boolean

  shuttleTasksModuleAvailable: boolean = false;

  enableAllocation: boolean = false;

  groupSections: any = [];

  // Campaign Module Available
  campaignModuleAvailable: boolean = false

  constructor(
    private injector: Injector,
    private utilityService: UtilityService,
    private groupService: GroupService,
    public dialog: MatDialog,
    private router: ActivatedRoute) { }

  async ngOnInit() {

    // Fetch current group from the service
    this.groupData = await this.publicFunctions.getCurrentGroup();

    // Fetch the setting status
    this.enabledRights = this.groupData.enabled_rights;
    this.enabledProjectType = this.groupData.project_type;
    this.enabledShuttleType = this.groupData.shuttle_type;
    this.enabledCampaign = this.groupData.enabled_campaign

    // Fetch Current User
    this.userData = await this.publicFunctions.getCurrentUser();

    // Fetch Current Workspace
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    this.groupSections = await this.publicFunctions.getAllColumns(this.groupId);

    this.shuttleTasksModuleAvailable = await this.publicFunctions.isShuttleTasksModuleAvailable()

    // Campaign Module Status
    this.campaignModuleAvailable = await this.publicFunctions.isCampaignModuleAvailable()
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
    // Add a new member to group
    this.utilityService.asyncNotification($localize`:@@groupAdmin.pleaseWaitAddingUserToGroup:Please wait we are adding the new user to your group...`,
    new Promise((resolve, reject)=>{
      this.groupService.addNewUserToGroup(groupId, member)
      .then(()=> resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupAdmin.addedToGroup:${member.first_name} added to your group!`)))
      .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@groupAdmin.unableToAdd:Unable to add ${member.first_name} to your group, please try again!`)))
    }))
  }

  saveSettings(selected) {

    // Save the settings
    this.utilityService.asyncNotification($localize`:@@groupAdmin.pleaseWaitsavingSettings:Please wait we are saving the new setting...`,
      new Promise((resolve, reject)=>{
        if (selected.source.name === 'share_files') {
          this.groupService.saveSettings(this.groupId, {share_files: selected.checked})
            .then(()=> {
              this.groupData.share_files = selected.checked;
              this.publicFunctions.sendUpdatesToGroupData(this.groupData);
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupAdmin.settingsSaved:Settings saved to your group!`));
            })
            .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@groupAdmin.unableToSaveGroupSettings:Unable to save the settings to your group, please try again!`)))
        }

        if (selected.source.name === 'enabled_rights') {
          this.groupService.saveSettings(this.groupId, {enabled_rights: selected.checked})
            .then(()=> {
              this.enabledRights = selected.checked;
              this.groupData.enabled_rights = selected.checked;
              this.publicFunctions.sendUpdatesToGroupData(this.groupData);
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupAdmin.settingsSaved:Settings saved to your group!`));
            })
            .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@groupAdmin.unableToSaveGroupSettings:Unable to save the settings to your group, please try again!`)))
        }

        if (selected.source.name === 'enabled_project_type') {
          this.groupService.saveSettings(this.groupId, {project_type: selected.checked})
            .then(()=> {
              this.enabledProjectType = selected.checked;
              this.groupData.project_type = selected.checked;
              this.publicFunctions.sendUpdatesToGroupData(this.groupData);
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupAdmin.settingsSaved:Settings saved to your group!`));
            })
            .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@groupAdmin.unableToSaveGroupSettings:Unable to save the settings to your group, please try again!`)))
        }

        if (selected.source.name === 'enabled_shuttle_type') {
          this.groupService.saveSettings(this.groupId, {shuttle_type: selected.checked})
            .then(()=> {
              this.enabledShuttleType = selected.checked;
              this.groupData.shuttle_type = selected.checked;
              this.publicFunctions.sendUpdatesToGroupData(this.groupData);
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupAdmin.settingsSaved:Settings saved to your group!`));
            })
            .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@groupAdmin.unableToSaveGroupSettings:Unable to save the settings to your group, please try again!`)))
        }

        if (selected.source.name === 'enable_allocation') {
          this.groupService.saveSettings(this.groupId, {enable_allocation: selected.checked})
            .then(()=> {
              this.enableAllocation = selected.checked;
              this.groupData.enable_allocation = selected.checked;
              this.publicFunctions.sendUpdatesToGroupData(this.groupData);
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupAdmin.settingsSaved:Settings saved to your group!`));
            })
            .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@groupAdmin.unableToSaveGroupSettings:Unable to save the settings to your group, please try again!`)))
        }

        if(selected.source.name === 'enabled_campaign'){
          this.groupService.saveSettings(this.groupId, {enabled_campaign: selected.checked})
          .then(()=> {
            this.enabledCampaign = selected.checked;
            this.groupData.enabled_campaign = selected.checked;
            this.publicFunctions.sendUpdatesToGroupData(this.groupData);
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupAdmin.settingsSaved:Settings saved to your group!`));
          })
          .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@groupAdmin.unableToSaveGroupSettings:Unable to save the settings to your group, please try again!`)))
        }
      }));
  }

  selectShuttleSection(column: any) {

    this.utilityService.asyncNotification($localize`:@@groupAdmin.pleaseWaitsavingSettings:Please wait we are saving the new setting...`,
      new Promise((resolve, reject)=>{
        this.groupService.selectShuttleSection(this.groupId, column)
        .then((res)=> {
          this.publicFunctions.sendUpdatesToGroupData(res['group']);
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupAdmin.settingsSaved:Settings saved to your group!`));
        })
        .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@groupAdmin.unableToSaveGroupSettings:Unable to save the settings to your group, please try again!`)))
      }));
  }

  openBarModal(groupId){
    const dialogRef = this.dialog.open(GroupBarDialogComponent, {
      width: '100%',
      height: '100%',
      disableClose: true,
      data: { groupData: this.groupData }
    });
    const sub = dialogRef.componentInstance.closeEvent.subscribe(async (data) => {
      this.groupData = await this.publicFunctions.getCurrentGroup();
    });
    dialogRef.afterClosed().subscribe(result => {
      sub.unsubscribe();
    });
  }
}
