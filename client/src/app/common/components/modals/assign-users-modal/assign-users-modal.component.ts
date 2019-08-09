import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {GroupService} from "../../../../shared/services/group.service";
import {PostService} from "../../../../shared/services/post.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
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

  onDeSelectAll(items: any) {
    this.assignment = 'Unassigned';
  }

  OnItemDeSelect(item: any) {
    if (this.selectedGroupUsers.length < 1) {
      this.assignment = 'Unassigned';
    }
  }

  onItemSelect(item: any) {
    if (this.selectedGroupUsers.length >= 1) {
      this.assignment = 'Assigned';
    }
    this.usersSelected.emit(this.selectedGroupUsers);
  }

  onSelectAll(items: any) {
    this.assignment = 'Assigned';
  }

  onSearch(evt: any) {
    this.groupService.searchGroupUsers(this.group._id, evt.target.value)
      .subscribe((res) => {
        this.groupUsersList = res['users'];
      }, (err) => {

      });
  }

  onUsersSelected() {
    this.usersSelected.emit(this.selectedGroupUsers);
  }

  openAssignPicker(assignContent) {
      this.modalService.open(assignContent, {centered: true});
  }
}
