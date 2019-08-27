import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {GroupService} from "../../../../shared/services/group.service";
import {PostService} from "../../../../shared/services/post.service";
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { environment } from "../../../../../environments/environment";

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'assign-users-modal',
  templateUrl: './assign-users-modal.component.html',
  styleUrls: ['./assign-users-modal.component.scss']
})
export class AssignUsersModalComponent implements OnInit {

  // list of users who get assigned this task/event
  @Input('selectedGroupUsers') selectedGroupUsers = [];
  @Input('group') group;
  @Input('settings') settings;
  @Input('type') type;

  @Output('usersSelected') usersSelected = new EventEmitter();

  // assignment status
  assignment = 'Unassigned';

  // complete list of all the users of the group
  groupUsersList = [];
  selected = false;
  userProfileImage = null;

  constructor(private groupService: GroupService, private postService: PostService, private modalService: NgbModal) { }

  ngOnInit() {

    if (this.selectedGroupUsers.length > 0) {
      this.assignment = 'Assigned';
    }

    this.groupService.getAllGroupUsers(this.group._id)
      .subscribe((res) => {
        this.groupUsersList = res['users'];
      }, (err) => {
      });

    // Settings for angular2-multiselect-dropdown is set in postbox.component.ts
  }

  onItemSelect(item: any) {
    // if (this.selected === false){
    //   this.selected = true;
    //   this.assignment = 'Assigned';
    //   this.selectedGroupUsers = [];
    //   this.selectedGroupUsers.unshift(item);
    //   this.userProfileImage = `${environment.BASE_URL}/uploads/${item['profile_pic']}`;
    //   this.usersSelected.emit(this.selectedGroupUsers);
    //   console.log(item,"item",this.selectedGroupUsers)
    // } else {
      // this.selectedGroupUsers = [];
      // this.usersSelected.emit(this.selectedGroupUsers);
      // this.selected = false;
      // this.assignment = 'Unassigned';
      // this.userProfileImage = null;
      // console.log(item,"item2",this.selectedGroupUsers)
    //}
    
      this.assignment = 'Assigned';
      this.selectedGroupUsers = [];
      this.selectedGroupUsers.unshift(item);
      this.userProfileImage = `${environment.BASE_URL}/uploads/${item['profile_pic']}`;
      this.usersSelected.emit(this.selectedGroupUsers);
      // console.log(item,"item",this.selectedGroupUsers)
  }
  onUnassignSelect(item: any) {

      this.selectedGroupUsers = [];
      this.usersSelected.emit(this.selectedGroupUsers);
      this.selected = false;
      this.assignment = 'Unassigned';
      this.userProfileImage = null;
      console.log(item,"item2",this.selectedGroupUsers)
      
  }

  onSearch(evt: any) {
    if (evt.target.value.length === 0){
      this.groupService.getAllGroupUsers(this.group._id)
        .subscribe((res) => {
          this.groupUsersList = res['users'];
        }, (err) => {
        });
    } else {
      this.groupService.searchGroupUsers(this.group._id, evt.target.value)
        .subscribe((res) => {
          this.groupUsersList = res['users'];
        }, (err) => {

        });
    }
  }
}
