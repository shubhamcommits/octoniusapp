import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PostService } from 'src/shared/services/post-service/post.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-multiple-assignments',
  templateUrl: './multiple-assignments.component.html',
  styleUrls: ['./multiple-assignments.component.scss']
})
export class MultipleAssignmentsComponent implements OnInit {

  @Input() groupId;
  @Input() userData;
  @Input() post;

  @Output() assigneeAddedEmiter = new EventEmitter();

  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  constructor(
    public utilityService: UtilityService,
    private postService: PostService
  ) { }

  ngOnInit() {
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

  getMemberDetails(memberMap: any) {
    let assignee;
    // Assign the value of member map to the taskAssignee variable
    for (const member of memberMap.values()) {
      assignee = member;
    }

    this.utilityService.asyncNotification('Please wait we are updating the contents...', new Promise((resolve, reject) => {
      this.postService.addAssigneeToPost(this.post._id, assignee._id, this.post.type, this.post._group._id)
        .then((res) => {
          this.post = res['post'];
          // Emit the post to other components
          this.assigneeAddedEmiter.emit({post: this.post, assigneeId: assignee._id});

          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise(`Details updated!`));
        })
        .catch((err) => {
          reject(this.utilityService.rejectAsyncPromise(`Unable to update the details, please try again!`));
        });
    }));
  }
}
