import { Component, OnInit, Injector } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { ActivatedRoute } from '@angular/router';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { ManagementPortalService } from 'src/shared/services/management-portal-service/management-portal.service';

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

  // Current Group Data
  groupData: any = {}

  // Current Workspace Data
  workspaceData: any = {};

  myWorkplace = false;

  shuttleTasksModuleAvailable: boolean = false;

  // Campaign Module Available
  campaignModuleAvailable: boolean = false;

  isIndividualSubscription = false;

  constructor(
    private injector: Injector,
    private utilityService: UtilityService,
    private groupService: GroupService,
    private managementPortalService: ManagementPortalService,
    private router: ActivatedRoute) { }

  async ngOnInit() {

    // Fetch current group from the service
    this.groupData = await this.publicFunctions.getCurrentGroupDetails();

    // Fetch Current User
    this.userData = await this.publicFunctions.getCurrentUser();

    // Fetch Current Workspace
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    this.isIndividualSubscription = await this.managementPortalService.checkIsIndividualSubscription();

    this.myWorkplace = await this.publicFunctions.isPersonalNavigation(this.groupData, this.userData);

    this.shuttleTasksModuleAvailable = await this.publicFunctions.isShuttleTasksModuleAvailable()

    // Campaign Module Status
    this.campaignModuleAvailable = await this.publicFunctions.isCampaignModuleAvailable()
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object){
    return !(JSON.stringify(object) === JSON.stringify({}))
  }

  addNewUser(member: any){
    this.onAddNewUser(this.groupData?._id, member)

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
}
