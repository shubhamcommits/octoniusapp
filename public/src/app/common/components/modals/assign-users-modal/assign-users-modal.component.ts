import {Component, OnInit, ViewChild} from '@angular/core';
import {GroupService} from "../../../../shared/services/group.service";
import {PostService} from "../../../../shared/services/post.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'assign-users-modal',
  templateUrl: './assign-users-modal.component.html',
  styleUrls: ['./assign-users-modal.component.scss']
})
export class AssignUsersModalComponent implements OnInit {

  @ViewChild('assignContent') assignContent;

  // complete list of all the users of the group
  groupUsersList = [];

  // Have there been any users assigned?
  assignment = 'UnAssigned';

  // list of users who get assigned this task/event
  selectedGroupUsers = [];
  group;

  settings;

  modalRef;

  constructor(private groupService: GroupService, private postService: PostService, private modalService: NgbModal) { }

  ngOnInit() {
    this.postService.openAssignUsers
      .subscribe((values: any) => {
        this.selectedGroupUsers = values.selectedGroupUsers || [];
        this.group = values.group;
        this.openAssignUsersModal(values.options);
        this.settings = values.settings || null;
      });
  }


  onDeSelectAll(items: any) {
    this.assignment = 'UnAssigned';
  }

  OnItemDeSelect(item: any) {
    if (this.selectedGroupUsers.length < 1) {
      this.assignment = 'UnAssigned';
    }
  }

  onItemSelect(item: any) {
    if (this.selectedGroupUsers.length >= 1) {
      this.assignment = 'Assigned';
    }
  }

  onSelectAll(items: any) {
    this.assignment = 'Assigned';
  }

  onSearch(evt: any) {
    this.groupUsersList = [];
    this.groupService.searchGroupUsers(this.group._id, evt.target.value)
      .subscribe((res) => {
        this.groupUsersList = res['users'];
      }, (err) => {

      });
  }

  onUsersSelected() {
    this.postService.usersAssigned.next({ selectedGroupUsers: this.selectedGroupUsers, assignment: this.assignment} );
  }

  openAssignUsersModal(options) {
    this.modalRef = this.modalService.open(this.assignContent, options);
  }

}
