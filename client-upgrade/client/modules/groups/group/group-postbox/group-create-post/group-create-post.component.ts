import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-group-create-post',
  templateUrl: './group-create-post.component.html',
  styleUrls: ['./group-create-post.component.scss']
})
export class GroupCreatePostComponent implements OnInit {

  constructor() { }

  // BASE URL OF THE APPLICATION
  baseUrl = environment.UTILITIES_BASE_URL;

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

  // UserData Object
  @Input('userData') userData: any;

  // GroupId variable
  @Input('groupId') groupId: any;

  // Post Type = 'normal', 'task', or 'event'
  @Input('type') type: string = 'normal';

  // Close event emitter takes care of closing the modal
  @Output('close') close = new EventEmitter();

  ngOnInit() {
  }

  /**
   * Get Quill Data from the @module <quill-editor></quill-editor>
   * @param $event 
   */
  getQuillData(quillData: any) {
    console.log(quillData)
  }

  closeModal() {
    this.close.emit()
  }

  getMemberDetails(memberMap: any) {

    if (this.type == 'task') {

      // Set the Assign state of task to be true
      this.assigned = true

      // Assign the value of member map to the taskAssignee variable
      for (let member of memberMap.values())
        this.taskAssignee = member

    } else if(this.type == 'event'){

      // Assign the eventMembersMap to the output from component
      this.eventMembersMap = memberMap

    }

  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return !(JSON.stringify(object) === JSON.stringify({}))
  }

  /**
   * This function is called whenever the component is destroyed
   */
  ngOnDestroy() {
  }

}
