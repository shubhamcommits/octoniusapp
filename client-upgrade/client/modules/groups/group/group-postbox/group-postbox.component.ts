import { Component, OnInit, Input } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-group-postbox',
  templateUrl: './group-postbox.component.html',
  styleUrls: ['./group-postbox.component.scss']
})
export class GroupPostboxComponent implements OnInit {

  constructor() { }

  // BASE URL OF THE APPLICATION
  baseUrl = environment.UTILITIES_BASE_URL;

  // GroupId variable
  @Input('groupId') groupId: any;

  // UserData Object
  @Input('userData') userData: any;

  // Variable to showpostbox or not
  showPostBox: boolean = false;

  ngOnInit() {
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return !(JSON.stringify(object) === JSON.stringify({}))
  }

}
