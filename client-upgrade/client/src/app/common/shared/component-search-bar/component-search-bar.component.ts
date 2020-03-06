import { Component, OnInit, Input, Injector, Output, EventEmitter } from '@angular/core';
import { AdminService } from 'src/shared/services/admin-service/admin.service';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-component-search-bar',
  templateUrl: './component-search-bar.component.html',
  styleUrls: ['./component-search-bar.component.scss']
})
export class ComponentSearchBarComponent implements OnInit {

  constructor(private injector: Injector) { }

  // Define User server base Url
  userBaseUrl = environment.USER_BASE_URL;

  @Input('placeholder') placeholder: string = '';

  // Type are 'workspace', 'group', 'skill'
  @Input('type') type: string;

  // Incase the type is 'workspace'
  @Input('workspaceId') workspaceId?: string;

  // Incase the type is 'group'
  @Input('groupId') groupId?: string;

  // User Data Object
  @Input('userData') userData: any = {};

  // Skill Emitter which emits the skill object on creation
  @Output('skill') skillEmitter = new EventEmitter();

  // Public Functions class
  private publicFunctions = new PublicFunctions(this.injector);

  // Item List array varible
  itemList: any = [{
    "_id": "5e3d1508741c1517a0b50c92",
    "skills": "programming"
  }]

  ngOnInit() {
    console.log(this.type)
  }

  async userSearchQuery(query: Event) {
    try {
      console.log(query.target['value']);
      let results = await this.searchWorkspaceMembers(this.workspaceId, query.target['value']);
      console.log(results);
    } catch (err) {
      this.publicFunctions.catchError(err);
    }
  }

  async searchWorkspaceMembers(workspaceId: string, query: string) {
    try {
      return new Promise(async (resolve) => {
        let workspaceService = this.injector.get(WorkspaceService);
        let test = await workspaceService.searchWorkspaceMembers(workspaceId, query)
        console.log(test);
      })

    } catch (err) {
      this.publicFunctions.catchError(err);
    }
  }

  async isGroupMember(item: any) {

  }

  async memberJustAddedToGroup(item: any) {

  }

  async onAddNewMember(item: any) {

  }

  /**
   * This function emits the skill as an object
   * @param skill 
   */
  async onAddSkill(skill: any){
    this.skillEmitter.emit(skill);
  }

  /**
   * This function checks if a skill exist in users's skills array
   * @param skill 
   */
  async hasSkill(skill: any){
    
    // Check if the skill exist in the users' skills array
    if(this.userData.skills.includes(skill))
      return true;

    return false
  }

}
