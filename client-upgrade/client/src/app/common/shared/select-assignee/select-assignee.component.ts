import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-select-assignee',
  templateUrl: './select-assignee.component.html',
  styleUrls: ['./select-assignee.component.scss']
})
export class SelectAssigneeComponent implements OnInit {

  constructor() { }

  // Post as the Input from component
  @Input('post') post: any;

  // User Data Input from component
  @Input('userData') userData: any;

  // Group Id Input
  @Input('groupId') groupId: any;

  // Type as the input from component 'board' or 'task'
  @Input('type') type: any;

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

  ngOnInit() {
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return !(JSON.stringify(object) === JSON.stringify({}))
  }

  getMemberDetails(memberMap: any) {

    if (this.post.type == 'task') {

      // Set the Assign state of task to be true
      this.assigned = true

      // Assign the value of member map to the taskAssignee variable
      for (let member of memberMap.values())
        this.taskAssignee = member

    }

  }

}
