import { Component, Input, Output, OnInit, EventEmitter, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatMenuTrigger } from '@angular/material';
import { environment } from 'src/environments/environment';
import { PostService } from 'src/shared/services/post-service/post.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-multiple-assignments',
  templateUrl: './multiple-assignments.component.html',
  styleUrls: ['./multiple-assignments.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MultipleAssignmentsComponent implements OnInit {

  @Input() groupId;
  @Input() userData;
  @Input() post;

  @Output() assigneeAddedEmiter = new EventEmitter();

  @ViewChild(MatMenuTrigger, {static: true}) trigger: MatMenuTrigger;

  searchText = '';
  groupMembers = [];

  groupData;

  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  // Subsink Object
  subSink = new SubSink();

  constructor(
    public utilityService: UtilityService,
    private postService: PostService
  ) { }

  ngOnInit() {

    this.subSink.add(this.utilityService.currentGroupData.subscribe((res) => {
      if (JSON.stringify(res) != JSON.stringify({})) {

        // Assign the GroupData
        this.groupData = res;

        this.groupMembers = this.groupData._members.concat(this.groupData._admins);
        this.groupMembers = this.groupMembers.filter((member, index) => {
            return (this.groupMembers.findIndex(m => m._id == member._id) == index)
        });
      }
    }));

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subSink.unsubscribe();
  }

  unassign(assigneeId: string) {
    this.utilityService.asyncNotification('Please wait we are updating the contents...', new Promise((resolve, reject) => {
      this.postService.removeAssigneeFromPost(this.post._id, assigneeId, this.post.type)
        .then((res) => {
          const index = this.post._assigned_to.findIndex((assignee) => { assignee._id === assigneeId });
          this.post._assigned_to.splice(index, 1);

          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise(`Details updated!`));
        })
        .catch((err) => {
          reject(this.utilityService.rejectAsyncPromise(`Unable to update the details, please try again!`));
        });
    }));
  }

  getMemberDetails(member: any) {

    this.utilityService.asyncNotification('Please wait we are updating the contents...', new Promise((resolve, reject) => {
      this.postService.addAssigneeToPost(this.post._id, member._id, this.post.type, this.post._group._id)
        .then((res) => {
          this.post = res['post'];

          this.trigger.closeMenu();

          // Emit the post to other components
          this.assigneeAddedEmiter.emit({post: this.post, assigneeId: member._id});

          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise(`Details updated!`));
        })
        .catch((err) => {
          reject(this.utilityService.rejectAsyncPromise(`Unable to update the details, please try again!`));
        });
    }));
  }
}
