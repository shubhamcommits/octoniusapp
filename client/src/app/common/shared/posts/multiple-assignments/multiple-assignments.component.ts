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
  @Input() assigned_to = [];
  @Input() type; // post/flow

  @Output() assigneeAddedEmiter = new EventEmitter();
  @Output() assigneeRemovedEmiter = new EventEmitter();

  @ViewChild(MatMenuTrigger, {static: true}) trigger: MatMenuTrigger;

  searchText = '';
  groupMembers = [];

  isNewEvent = false;

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

    if (!this.post && this.type == 'post') {
      this.isNewEvent = true;
      this.post = {
        _assigned_to: []
      };
    }

    if (this.type == 'post' && !this.assigned_to) {
      this.assigned_to = this.post._assigned_to;
    }
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subSink.unsubscribe();
  }

  unassign(assigneeId: string) {
    if (this.type == 'post') {
      this.utilityService.asyncNotification('Please wait we are updating the contents...', new Promise((resolve, reject) => {
        this.postService.removeAssigneeFromPost(this.post._id, assigneeId)
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
    } else if (this.type == 'flow') {
      this.assigneeRemovedEmiter.emit({assigneeId: assigneeId});
    }
  }

  getMemberDetails(member: any) {
    const index = this.assigned_to.findIndex((assignee) => { assignee._id === member._id });
    if (index < 0) {
      if (this.type == 'post') {
        if (!this.isNewEvent) {
          this.utilityService.asyncNotification('Please wait we are updating the contents...', new Promise((resolve, reject) => {
            this.postService.addAssigneeToPost(this.post._id, member._id, (this.post._group || this.post._group._id))
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
        } else {
          this.post._assigned_to.push(member);
          this.trigger.closeMenu();

          // Emit the post to other components
          this.assigneeAddedEmiter.emit({post: this.post, assigneeId: member._id});
        }
      } else if (this.type == 'flow') {
        this.assigneeAddedEmiter.emit({assigneeId: member._id});
      }
    }
  }
}
