import { Component, OnInit, Input, Injector } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { UserService } from 'src/shared/services/user-service/user.service';

@Component({
  selector: 'app-user-skills',
  templateUrl: './user-skills.component.html',
  styleUrls: ['./user-skills.component.scss'],
})
export class UserSkillsComponent implements OnInit {

  constructor(
    public utilityService: UtilityService,
    public userService: UserService,
    public injector: Injector
  ) { }

  // User Data Object
  @Input('userData') userData: any = {};

  // Is current user variable
  @Input('currentUser') currentUser: boolean = false;

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
      this.userService.addSkill($event)
      .toPromise()
      .then(()=> resolve(this.utilityService.successNotification('New skill Added!')))
      .catch(() => reject(this.utilityService.errorNotification('Unable to add new skill, please try again!')));
    })
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

        // Remove the skill from the array
        this.userData.skills.splice(index, 1);

        // Send the updates to the userData over the application
        this.publicFunctions.sendUpdatesToUserData(this.userData);

        // Resolve the promise
        resolve(this.utilityService.warningNotification('Skill Removed!'))
      })
      .catch(() => reject(this.utilityService.errorNotification('Unable to add new skill, please try again!')));
    })
  }

}
