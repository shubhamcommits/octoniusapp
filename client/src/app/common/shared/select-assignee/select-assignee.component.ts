import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-select-assignee',
  templateUrl: './select-assignee.component.html',
  styleUrls: ['./select-assignee.component.scss']
})
export class SelectAssigneeComponent implements OnInit {

  
  @Input('post') post: any;
  @Input('userData') userData: any;
  @Input('groupId') groupId: any;
  @Input('workspaceData') workspaceData: any;
  @Input('type') type: any;
  @Input('showBar') showBar = true
  @Input('styleClass') styleClass = 'feed-avatar'
  
  @Output('member') member = new EventEmitter()

  /* Task Variables */
  
  // Task Assignee Variable
  taskAssignee = {
    profile_pic: '',
    role: '',
    first_name: '',
    last_name: '',
    email: ''
  }
  
  // Assigned State of Task
  assigned: boolean = false;
  
  /* Task Variables */
  
  /* Event Variables */
  
  // Members Map of Event Asignee
  eventMembersMap: any = new Map()
  
  /* Event Variables */
  
  constructor() { }

  ngOnInit() {
    if(this.post){
      if(this.post._assigned_to){
        this.assigned = true
        this.taskAssignee = this.post._assigned_to
      } else if(this.post._assigned_to) {
        this.post._assigned_to.forEach((member) => {
          this.eventMembersMap.set(member, member)
        });
      }
    }
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return !(JSON.stringify(object) === JSON.stringify({}))
  }

  /**
   * This function is responsible for assigning the assignee
   * @param memberMap
   */
  getMemberDetails(memberMap: any) {

    if (this.type == 'task') {

      // Set the Assign state of task to be true
      this.assigned = true

      // Assign the value of member map to the taskAssignee variable
      for (let member of memberMap.values())
        this.taskAssignee = member

      // Emit the output as the taskAssignee
      this.member.emit(this.taskAssignee)

    } else if (this.type == 'event') {

      // Assign the eventMembersMap to the output from component
      this.eventMembersMap = memberMap

      // Emit the output as the taskAssignee
      this.member.emit(this.eventMembersMap)

    } else if (this.type == 'workspaceMembers' || this.type == 'holidays') {
      this.userData = memberMap;
      // Emit the output as the taskAssignee
      this.member.emit(this.userData)
    }

  }

  /**
   * This function checks if the map consists of all team as the assignee for the event type selection
   * @param map
   */
  eventAssignedToAll(map: Map<any, any>){
    return map.has('all');
  }

}
