import { Component, OnInit, Injector } from '@angular/core';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import { ActivatedRoute } from '@angular/router';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { GroupService } from 'src/shared/services/group-service/group.service';

@Component({
  selector: 'app-group-admin',
  templateUrl: './group-admin.component.html',
  styleUrls: ['./group-admin.component.scss']
})
export class GroupAdminComponent implements OnInit {

  constructor(
    private injector: Injector,
    private router: ActivatedRoute) { }


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

  enableRights: boolean;


  async ngOnInit() {

    // Fetch current group from the service
    this.groupData = await this.publicFunctions.getCurrentGroup();

    // Fetch Current User
    this.userData = await this.publicFunctions.getCurrentUser();

    // Fetch Current Workspace
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
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

      console.log(this.groupData)

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

    utilityService.asyncNotification('Please wait we are saving the new setting...',
    new Promise((resolve, reject)=>{
      groupService.saveSettings(this.groupId, selected.source.name, selected.checked)
      .then(()=> resolve(utilityService.resolveAsyncPromise('Settings saved to your group!')))
      .catch(() => reject(utilityService.rejectAsyncPromise('Unable to save the settings to your group, please try again!')))
    }))
  }
  openBarModal(groupId){
    console.log(groupId);
  }
}
