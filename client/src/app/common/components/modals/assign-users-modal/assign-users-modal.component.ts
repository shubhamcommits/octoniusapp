import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {GroupService} from "../../../../shared/services/group.service";
import {PostService} from "../../../../shared/services/post.service";
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

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
    if (this.selected === false){
      this.selected = true;
      if (this.selectedGroupUsers.length >= 1) {
        this.assignment = 'Assigned';
      }
      this.selectedGroupUsers = [];
      this.selectedGroupUsers.unshift(item);
      this.usersSelected.emit(this.selectedGroupUsers);
    } else{
      this.selectedGroupUsers = [];
      this.usersSelected.emit(this.selectedGroupUsers);
      this.selected = false;
      this.assignment = 'Unassigned';
    }
  }


  onSearch(evt: any) {
    this.groupService.searchGroupUsers(this.group._id, evt.target.value)
      .subscribe((res) => {
        this.groupUsersList = res['users'];
      }, (err) => {

      });
  }
}
