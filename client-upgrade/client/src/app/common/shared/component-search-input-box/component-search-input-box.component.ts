import { Component, OnInit, Input, Injector, Output, EventEmitter } from '@angular/core';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs/internal/Subject';
import { SubSink } from 'subsink';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';
import { UserService } from 'src/shared/services/user-service/user.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Component({
  selector: 'app-component-search-input-box',
  templateUrl: './component-search-input-box.component.html',
  styleUrls: ['./component-search-input-box.component.scss']
})
export class ComponentSearchInputBoxComponent implements OnInit {

  constructor(private injector: Injector) { }

  // Define User server base Url
  userBaseUrl = environment.UTILITIES_BASE_URL;

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

  // Member Emitter which emits the member object on creation
  @Output('member') memberEmitter = new EventEmitter();

  // Public Functions class
  private publicFunctions = new PublicFunctions(this.injector);

  // Item value variable mapped with search field
  itemValue: string

  // This observable is mapped with item field to recieve updates on change value
  itemValueChanged: Subject<Event> = new Subject<Event>();

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  // Item List array varible
  itemList: any = [];

  // Create subsink class to unsubscribe the observables
  public subSink = new SubSink();

  ngOnInit() {

  }

  /**
   * This function handles of sending the data to the user(of skills or members)
   * Uses Debounce time and subscribe to the itemValueChanged Observable
   */
  ngAfterViewInit(): void {
    // Adding the service function to the subsink(), so that we can unsubscribe the observable when the component gets destroyed
    this.subSink.add(this.itemValueChanged
      .pipe(distinctUntilChanged(), debounceTime(500))
      .subscribe(async () => {
        if (this.type == 'skill' || this.type == 'group') {

          // If value is null then empty the array
          if (this.itemValue == "")
            this.itemList = []

          else {

            // Update the itemList with the skill set
            if(this.type === 'skill')
              this.itemList = await this.searchSkills(this.itemValue);

            if(this.type === 'group'){

                // Fetch the Items from the group search list
                this.itemList = await this.publicFunctions.membersNotInGroup(this.workspaceId, this.itemValue, this.groupId)

                // Update the itemList
                this.itemList = Array.from(new Set(this.itemList['users']))

              }

            // Don't add the null or existing skills value to the list
            if(this.type === 'skill')
              if (!this.itemList.includes(this.itemValue) && this.itemValue != "")
                  this.itemList = [this.itemValue, ...this.itemList];
            
          }

          // Stop the loading state once the values are loaded
          this.isLoading$.next(false);
        }
      }))
  }

  /**
   * This function observers on the change value of item
   * @param $event - value of item
   */
  onSearch($event: Event) {
    
    // Set loading state to be true
    this.isLoading$.next(true);

    // Set the itemValueChange
    this.itemValueChanged.next($event);
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
    
    // Set the Add Member state to false
    item.showAddMem = false

    // Emit the message to add the member
    this.memberEmitter.emit(item);
  }

  /**
   * This function makes the HTTP request to search the skills present in the database
   * @param skill 
   */
  async searchSkills(skill: string) {
    return new Promise((resolve, reject) => {

      // Define userService class object
      let userService = this.injector.get(UserService);

      // Search for skills in the database
      userService.searchSkills(skill)
        .then((res) => {
          resolve(res['skills'].map((skill: any) => skill.skills))
        })
        .catch(() => { reject([]) })
    })

  }

  /**
   * This function emits the skill as an object
   * @param skill 
   */
  async onAddSkill(skill: any) {
    
    // Emit the message to add the skill
    this.skillEmitter.emit(skill);

    // Update the userData skills set to show the skill added status
    this.userData.skills.push(skill);

    // Set the itemList to []
    this.itemList = [];

    // Set the itemValue to ""
    this.itemValue = "";
  }

  /**
   * This function checks if a skill exist in users's skills array
   * @param skill 
   */
  hasSkill(skill: string) {

    // Check if the skill exist in the users' skills array
    if (this.userData.skills.includes(skill))
      return true;

    else
      return false
  }

  /**
   * Unsubscribe all the observables on destroying the component
   */
  ngOnDestroy(){
    this.subSink.unsubscribe()
  }
}
