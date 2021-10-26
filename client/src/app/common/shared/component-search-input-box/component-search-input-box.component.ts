import { Component, OnInit, Input, Injector, Output, EventEmitter } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
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
  userBaseUrl = environment.UTILITIES_USERS_UPLOADS;

  @Input('placeholder') placeholder: string = '';

  // Type are 'task', 'event', 'group', 'skill', 'tag'
  @Input('type') type: string;

  // Incase the type is 'workspace'
  @Input('workspaceId') workspaceId?: string;

  // Incase the type is 'group'
  @Input('groupId') groupId?: string;

  // User Data Object
  @Input('userData') userData: any = {};

  @Input('groupData') groupData: any = {};

  @Input('workspaceData') workspaceData:any = {};

  @Input('rag') rag: string;

  @Input('ragMemberList') ragMemberList: any = [];

  @Input('ragList') ragList: any = [];

  // Skill Emitter which emits the skill object on creation
  @Output('skill') skillEmitter = new EventEmitter();

  // Member Emitter which emits the member object on creation
  @Output('member') memberEmitter = new EventEmitter();

  // Tag Emitter which emits the tag object on creation
  @Output('tag') tagEmitter = new EventEmitter();

  @Output('ragTag') ragTagEmitter = new EventEmitter();

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

  // Member array to store the selected members for task and events
  selectedMembers: any = new Map();

  // Members array
  members: any = []

  // Tags array
  tags: any = []

  ngOnInit() {
  }

  /**
   * This function handles of sending the data to the user(of skills or members)
   * Uses Debounce time and subscribe to the itemValueChanged Observable
   */
  ngAfterViewInit(): void {
    if (this.itemValue == "")
      this.itemList = []
    // Adding the service function to the subsink(), so that we can unsubscribe the observable when the component gets destroyed
    this.subSink.add(this.itemValueChanged
      .pipe(distinctUntilChanged(), debounceTime(500))
      .subscribe(async () => {
        if (this.type == 'skill' || this.type == 'group' || this.type == 'task' || this.type == 'event' || this.type === 'tag' || this.type === 'ragTag' || this.type === 'ragMembers' || this.type === 'workspaceMembers') {

          // If value is null then empty the array
          if (this.itemValue == "")
            this.itemList = []

          else {
            if(this.type === 'ragTag') {
              this.itemList = this.groupData.rags;
              this.itemList = this.itemList.filter( item => item.rag_tag.includes(this.itemValue));

              this.itemList.forEach(item => {
                const index = (this.ragList) ? this.ragList.findIndex(rag => (rag._id == item._id) || ((rag.rag_tag || rag) == item.rag_tag)) : -1;
                if(index >= 0) {
                  item.showAddButton =false;
                } else {
                  item.showAddButton = true;
                }
              });
            }

            if(this.type === 'ragMembers') {
              this.itemList = this.groupData._members.filter( member => {
                let item = member.first_name.toLowerCase() + ' ' + member.last_name.toLowerCase();
                return item.includes(this.itemValue.toLowerCase());
              });

              this.itemList.forEach(item => {
                const index = (this.ragMemberList) ? this.ragMemberList.findIndex(member => member._id == item._id) : -1;
                if(index >= 0) {
                  item.showAddMem = true;
                } else {
                  item.showAddMem = false;
                }
              });
            }

            if(this.type === 'workspaceMembers') {
              this.itemList = this.workspaceData.members.filter( member => {
                let item = member.first_name.toLowerCase() + ' ' + member.last_name.toLowerCase()
                return item.includes(this.itemValue.toLowerCase());
              });
              this.itemList.forEach(item => {
                if(this.ragMemberList.includes(item)){
                  item.showAddMem = true;
                } else {
                  item.showAddMem = false;
                }
              });
            }

            // Update the itemList with the skill set
            if (this.type === 'skill')
              this.itemList = await this.searchSkills(this.itemValue);

            // Update the itemList with tags set
            if (this.type === 'tag')
              this.itemList = await this.publicFunctions.getTags(this.groupId, this.itemValue) || []


            if (this.type === 'task' || this.type === 'event') {
              this.itemList = await this.publicFunctions.searchGroupMembers(this.groupId, this.itemValue) || []

              // Update the itemList
              this.itemList = Array.from(new Set(this.itemList['users']))

              // If type is event, then we should give an option of adding all team as the assignee too
              if (this.type === 'event') {
                this.itemList.unshift({
                  _id: 'all',
                  first_name: 'all',
                  last_name: 'team'
                })
              }
            }

            if (this.type === 'group') {

              // Fetch the Items from the group search list
              this.itemList = await this.publicFunctions.membersNotInGroup(this.workspaceId, this.itemValue, this.groupId)

              // Update the itemList
              this.itemList = Array.from(new Set(this.itemList['users']))

            }

            // Don't add the null or existing skills value to the list
            if (this.type === 'skill' || this.type === 'tag')
              if (!this.itemList.includes(this.itemValue) && this.itemValue != "")
                this.itemList = [this.itemValue, ...this.itemList];

          }

          // Stop the loading state once the values are loaded
          this.isLoading$.next(false);
        }
      }));
  }

  /**
   * This function clears the list on the UI if the input changes accordingly
   * @param $event
   */
  modelChange($event: any) {
    this.itemValue = $event;
    if ($event == "" || $event === null || $event === undefined)
      this.itemList = []
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
      let results = await this.searchWorkspaceMembers(this.workspaceId, query.target['value']);
    } catch (err) {
      this.publicFunctions.sendError(err);
    }
  }

  async searchWorkspaceMembers(workspaceId: string, query: string) {
    try {
      return new Promise(async (resolve) => {
        let workspaceService = this.injector.get(WorkspaceService);
        let test = await workspaceService.searchWorkspaceMembers(workspaceId, query)
      })

    } catch (err) {
      this.publicFunctions.sendError(err);
    }
  }

  async isGroupMember(item: any) {

  }

  removeMemberFromMap(item: any) {

    // If all team members are removed
    if(item._id === 'all'){

      // Empty the members array
      this.members = []

      // Empty the members map
      this.selectedMembers.clear()

      // Set all the other items to be as not Assigned
      this.itemList.forEach((element: any) => {
        element.showAddMem = true
      })

    }

    if (this.members.length >= 0 && this.selectedMembers.size >= 0) {

      const memberIndex = (this.members) ? this.members.findIndex((member) => item._id === member) : -1;
      // Removing the user from array
      this.members.splice(memberIndex, 1);

      // Enable the user so that it can be added again
      item.showAddMem = true

      // Removing the user from map
      this.selectedMembers.delete(item._id);

      // Emit the selectedMembers map to the other components
      this.memberEmitter.emit(this.selectedMembers);
    }

  }

  memberJustAddedToMap(item: any) {
    return this.selectedMembers.has(item._id)
  }

  addToSelectedMember(item: any) {

    // If We have all team selected as the assignee for the event
    if (item._id === 'all') {

      // Empty the members array
      this.members = [];

      // Empty the members map
      this.selectedMembers.clear();

      // Set all the other items to be as not Assigned
      this.itemList.forEach((element: any) => {
        element.showAddMem = true;
      });

      // Set the Add Member state to false
      item.showAddMem = false;

      // Push item into array
      this.members.push(item);

      // Map the array and return a map without duplicates
      this.selectedMembers = new Map(this.members.map((member: any) => [member._id, member]));

      // Emit the selectedMembers map to the other components
      this.memberEmitter.emit(this.selectedMembers);
    }

    // If we don'y have all team selected as the assignee
    if (!this.selectedMembers.has('all')) {
      if (this.type === 'task') {

        // Mark all the other items on the UI to be as not assigned
        this.itemList.forEach((element: any) => {
          element.showAddMem = true;
        });

        // Empty the members array since we have to push only one element to the selectedMembers Map
        this.members = [];
      }

      // Set the Add Member state to false
      item.showAddMem = false;

      // Push item into array
      this.members.push(item);

      // Map the array and return a map without duplicates
      this.selectedMembers = new Map(this.members.map((member: any) => [member._id, member]));

      // Emit the selectedMembers map to the other components
      this.memberEmitter.emit(this.selectedMembers);
    }

    // Clear search input after assigning
    this.itemValue = '';

    // Close the list after assigning
    this.itemList = [];
  }

  onAddNewMember(item: any) {
    if(item.rags === undefined){
      item.rags = [];
    }
    item.rags.push(this.rag);
    // Set the Add Member state to false
    item.showAddMem = false

    // Emit the message to add the member
    this.memberEmitter.emit(item);
    // Clear search input after assigning
    this.itemValue = '';
    // Close the list after assigning
    this.itemList = [];
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
   * This function emits the tag as an object
   * @param tag
   */
  async onAddTag(tag: any) {

    // Emit the message to add the tag
    if (this.type === 'tag') {
      this.tagEmitter.emit(tag);
    }
    else if (this.type === 'ragTag') {
      this.ragTagEmitter.emit(tag);
    }

    // Update the tags array
    this.tags.push(tag);

    // Set the itemList to []
    this.itemList = [];

    // Set the itemValue to ""
    this.itemValue = "";
  }

  /**
   * This function checks if a tag exist in post skills array
   * @param tag
   */
  hasTag(tag: string) {

    // Check if the tag exist in the tags array
    if (this.tags.includes(tag))
      return true;

    else
      return false
  }

  /**
   * Unsubscribe all the observables on destroying the component
   */
  ngOnDestroy() {
    this.subSink.unsubscribe()
    this.isLoading$.complete()
  }

  focusOut() {
    this.itemList = [];
  }
}
