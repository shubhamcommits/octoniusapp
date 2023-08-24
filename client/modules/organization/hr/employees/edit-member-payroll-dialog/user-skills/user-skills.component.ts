import { Component, OnInit, Input, Injector } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { UserService } from 'src/shared/services/user-service/user.service';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { GroupsService } from 'src/shared/services/groups-service/groups.service';

@Component({
  selector: 'app-user-skills',
  templateUrl: './user-skills.component.html',
  styleUrls: ['./user-skills.component.scss'],
})
export class UserSkillsComponent implements OnInit {

  constructor(
    public utilityService: UtilityService,
    public userService: UserService,
    public groupService: GroupService,
    public groupsService: GroupsService,
    public workspaceService: WorkspaceService,
    public injector: Injector
  ) { }

  // User Data Object
  @Input('userData') userData: any = {};

  currentGroupSettings: any = {
    emailDomains: [],
    jobPositions: [],
    skills: []
  };

  // Public Functions class
  public publicFunctions = new PublicFunctions(this.injector);

  ngOnInit() {
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object){
    return !(JSON.stringify(object) === JSON.stringify({}))
  }

  /**
   * This function adds new skill to user's skill set
   * @param $event
   */
  addNewSkill($event: string){
    return new Promise((resolve, reject)=>{
      this.userService.addSkill($event).toPromise()
        .then(()=> {
          if (!this.userData.skills) {
            this.userData.skills = [];
          }
          this.userData.skills.push($event);
          this.autoUpdateGroups();
          resolve(this.utilityService.successNotification($localize`:@@userSkills.newSkillAdded:New skill Added!`));
        })
        .catch(() => reject(this.utilityService.errorNotification($localize`:@@userSkills.unableToAddSkill:Unable to add new skill, please try again!`)));
    });
  }

  /**
   * This function removes a skill from users' skill set
   * @param skill - string name
   * @param index - index of array in which it is location
   */
  removeSkill(skill: string, index: number){
    return new Promise((resolve, reject)=>{
      this.userService.removeSkill(skill)
      .toPromise()
      .then(()=> {

        this.autoUpdateGroups();

        // Remove the skill from the array
        this.userData.skills.splice(index, 1);

        // Send the updates to the userData over the application
        this.publicFunctions.sendUpdatesToUserData(this.userData);

        // Resolve the promise
        resolve(this.utilityService.warningNotification($localize`:@@userSkills.skillRemoved:Skill Removed!`))
      })
      .catch(() => reject(this.utilityService.errorNotification($localize`:@@userSkills.unableToRemoveSkill:Unable to remove skill, please try again!`)));
    })
  }

  /**
   * Executes whenever a skill is added or deleted.
   * Responsible for automatically adding or removing
   * group members.
   */
  autoUpdateGroups() {
    const workspaceId = this.userData._workspace._id || this.userData._workspace;
    this.groupsService.getWorkspaceGroups(workspaceId)
      .then(res => {
        res['groups'].forEach(group => {
          this.groupService.updateSmartGroupMembers(
            group._id || group,
            {
              workspaceId: workspaceId
            }
          ).subscribe(
            res => {
              this.publicFunctions.sendUpdatesToGroupData(res['group']);
            },
            error => {
              this.utilityService.errorNotification($localize`:@@userSkills.errorOccurredWhileModifyingMembers:An error occurred while modifying the members of the group.`);
              console.error(error);
            }
          );
        });
      });
  }
}
