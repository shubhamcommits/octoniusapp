import { Component, Input, Output, OnChanges, EventEmitter, ViewChild, ViewEncapsulation, Injector, OnInit } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { PublicFunctions } from 'modules/public.functions';
import { environment } from 'src/environments/environment';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { PostService } from 'src/shared/services/post-service/post.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-multiple-assignments',
  templateUrl: './multiple-assignments.component.html',
  styleUrls: ['./multiple-assignments.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MultipleAssignmentsComponent implements OnChanges, OnInit {

  @Input() groupId;
  @Input() workspaceData;
  @Input() userData;
  @Input() post;
  @Input() portfolio;
  @Input() assigned_to = [];
  @Input() type; // post/flow/filter/chat/portfolio
  @Input() canEdit = true;

  @Output() assigneeAddedEmiter = new EventEmitter();
  @Output() assigneeRemovedEmiter = new EventEmitter();

  @ViewChild(MatMenuTrigger, {static: true}) trigger: MatMenuTrigger;

  searchText = '';
  members = [];

  isNewEvent = false;

  groupData;

  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  isShuttleTasksModuleAvailable = false;

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  // Subsink Object
  subSink = new SubSink();

  constructor(
    private utilityService: UtilityService,
    private postService: PostService,
    private groupService: GroupService,
    private injector: Injector
  ) { }

  async ngOnChanges() {

    if (this.type != 'chat' && this.groupId) {
        this.groupService.getAllGroupMembers(this.groupId).then(res => {
          this.members = res['users'];

          this.members.unshift({_id: 'all', first_name: 'All', last_name: 'members', email: ''});
        });
    } else if (this.type != 'portfolio') {
      if (!this.workspaceData) {
        this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
      }
      
      this.members = await this.workspaceData?.members;
      this.members = await this.members?.filter((member) => {
        return ['owner', 'admin', 'manager'].includes(member?.role);
      });
    } else {
      if (!this.workspaceData) {
        this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
      }
      
      this.members = await this.workspaceData?.members;
      this.members = await this.members?.filter((member, index) => {
          return (this.members?.findIndex(m => m._id == member._id) == index)
      });
    }

    if (!this.post && this.type == 'post') {
      this.isNewEvent = true;
      this.post = {
        _assigned_to: []
      };
    }

    if (this.type == 'post' && this.post) {
      this.assigned_to = this.post._assigned_to;
    }

    if (this.type == 'portfolio' && this.portfolio) {
      this.assigned_to = this.portfolio?._members;
    }

    if (!this.assigned_to) {
      this.assigned_to = [];
    }
  }

  async ngOnInit() {
    this.isShuttleTasksModuleAvailable = await this.publicFunctions.isShuttleTasksModuleAvailable();
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subSink.unsubscribe();
  }

  unassign(assigneeId: string) {
    if (this.canEdit) {
      if (this.type == 'post') {
        this.utilityService.asyncNotification($localize`:@@multipleAssignments.pleaseWaitWeAreUpdatingContents:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
          this.postService.removeAssigneeFromPost(this.post._id, assigneeId)
            .then((res) => {
              this.post = res['post'];
              const index = this.assigned_to.findIndex((assignee) => assignee._id == assigneeId);
              this.assigned_to.splice(index, 1);

              this.assigneeRemovedEmiter.emit({ post: this.post });
              // Resolve with success
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@multipleAssignments.assigneeRemoved:Assignee removed!`));
            })
            .catch((err) => {
              reject(this.utilityService.rejectAsyncPromise($localize`:@@multipleAssignments.unableToUpdateDetails:Unable to update the details, please try again!`));
            });
        }));
      } else if (this.type == 'flow') {
        this.assigneeRemovedEmiter.emit({ assigneeId: assigneeId });
      } else if (this.type == 'portfolio') {
        const index = this.assigned_to.findIndex((assignee) => assignee._id == assigneeId);
        this.assigned_to.splice(index, 1);
        this.assigneeRemovedEmiter.emit({ assignee: assigneeId });
      } else if (this.type == 'filter' || this.type == 'chat') {
        const index = this.assigned_to.findIndex((assignee) => assignee._id == assigneeId);
        this.assigned_to.splice(index, 1);
        this.assigneeRemovedEmiter.emit(assigneeId);
      }
    }
  }

  getMemberDetails(selectedMember: any) {
    let assignees = [];

    if (selectedMember._id == 'all') {
      assignees = this.members.filter((member)=> {
        return member._id != 'all';
      });
    } else {
      assignees = [selectedMember];
    }

    assignees.forEach(member => {
      const index = this.assigned_to.findIndex((assignee) => assignee._id == member._id);
      if (index < 0) {
        if (this.type == 'post') {
          if (!this.isNewEvent) {
            this.utilityService.asyncNotification($localize`:@@multipleAssignments.pleaseWaitWeAreUpdatingContents:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
              this.postService.addAssigneeToPost(this.post._id, member._id, this.groupId, this.isShuttleTasksModuleAvailable)
                .then((res) => {
                  this.post = res['post'];
                  this.assigned_to.push(member);

                  // Emit the post to other components
                  this.assigneeAddedEmiter.emit({post: this.post, assigneeId: member._id});

                  // Resolve with success
                  resolve(this.utilityService.resolveAsyncPromise($localize`:@@multipleAssignments.assigneeAdded:Assignee added!`));
                })
                .catch((err) => {
                  reject(this.utilityService.rejectAsyncPromise($localize`:@@multipleAssignments.unableToAssignDetails:Unable to assign, please try again!`));
                });
            }));
          } else {
            // Emit the post to other components
            this.assigneeAddedEmiter.emit({post: this.post, assigneeId: member._id});
          }
        } else if (this.type == 'flow') {
          //this.trigger.closeMenu();
          this.assigneeAddedEmiter.emit({ assignee: member });
        } else if (this.type == 'filter' || this.type == 'chat') {
          this.assigned_to.push(member);
          this.assigneeAddedEmiter.emit(member);
        } else if (this.type == 'portfolio') {
          this.assigned_to.push(member);
          this.assigneeAddedEmiter.emit({ assignee: member?._id });
        }
      }
    });
  }
}
