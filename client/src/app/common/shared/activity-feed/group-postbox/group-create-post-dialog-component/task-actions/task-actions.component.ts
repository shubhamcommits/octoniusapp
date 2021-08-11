import { AfterViewInit, Component, EventEmitter, Injector, Input, OnDestroy, OnChanges, OnInit, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { distinctUntilChanged } from 'rxjs/internal/operators/distinctUntilChanged';
import { PostService } from 'src/shared/services/post-service/post.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';
import { GroupCreatePostDialogComponent } from '../group-create-post-dialog-component.component';

@Component({
  selector: 'app-task-actions',
  templateUrl: './task-actions.component.html',
  styleUrls: ['./task-actions.component.scss']
})
export class TaskActionsComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {

  @Input() postData: any;
  @Input() groupData: any;
  @Input() userData: any;
  @Input() tasks: any;
  @Input() isNorthStar = false;
  @Input() isMilestone = false;
  @Input() isIdea = false;
  @Input() isIdeaModuleAvailable = false;
  @Input() isShuttleTasksModuleAvailable = false;

  @Output() parentTaskSelectedEmitter = new EventEmitter();
  @Output() dependencyTaskSelectedEmitter = new EventEmitter();
  @Output() taskClonedEmitter = new EventEmitter();
  @Output() taskFromTemplateEmitter = new EventEmitter();
  @Output() taskAllocationEmitter = new EventEmitter();
  @Output() transformIntoNorthStarEmitter = new EventEmitter();
  @Output() transformIntoMilestoneEmitter = new EventEmitter();
  @Output() transformIntoIdeaEmitter = new EventEmitter();
  @Output() shuttleGroupEmitter = new EventEmitter();

  userGroups = [];
  transferAction = '';
  menuLable:string='Assignee';
  menuFor:string='Task';
  searchText = '';
  groupMembers = [];
  shuttleGroups: any = [];

  parentTask: boolean = false;
  isChild: boolean = false;
  isDependent: boolean = false;
  tasksList: any = [];
  dependencyTask: any = [];
  searchingOn: string = 'keyword';
  // Item value variable mapped with search field
  itemValue: string;
  dependencyItemValue: string;

  groupTemplates = [];
  templateAction = '';

  allocation = '';

  // This observable is mapped with item field to recieve updates on change value
  itemValueChanged: Subject<Event> = new Subject<Event>();

  // Create subsink class to unsubscribe the observables
  public subSink = new SubSink();

  // isLoadingAction behaviou subject maintains the state for loading spinner
  public isLoadingAction$ = new BehaviorSubject(false);

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private _router: Router,
    private utilityService: UtilityService,
    private postService: PostService,
    private injector: Injector,
    private mdDialogRef: MatDialogRef<GroupCreatePostDialogComponent>
  ) { }

  async ngOnChanges() {

    if (this.postData.type === 'task' && this.groupData && this.userData) {
      // Fetches the user groups from the server
      await this.publicFunctions.getAllUserGroups(this.groupData._workspace, this.userData._id)
        .then((groups: any) => {
          groups.forEach(async group => {
            group.sections = await this.publicFunctions.getAllColumns(group._id);
            if (group.sections) {
              group.sections.sort((s1, s2) => (s1.title > s2.title) ? 1 : -1);
              this.utilityService.removeDuplicates(group.sections, 'title').then((sections) => {
                group.sections = sections;
              });
            }
            if (group._id != this.groupData._id && group.sections) {
              this.userGroups.push(group);
            }
          });
          this.userGroups.sort((g1, g2) => (g1.group_name > g2.group_name) ? 1 : -1);
          this.utilityService.removeDuplicates(this.userGroups, '_id').then((groups) => {
            this.userGroups = groups;
          });
        })
        .catch(() => {
          // If the function breaks, then catch the error and console to the application
          this.publicFunctions.sendError(new Error('Unable to connect to the server, please try again later!'));
        });
    }

    if (this.postData.type === 'task' && this.groupData && this.groupData?.shuttle_type) {
      const groupId = (this.groupData?._id == this.postData?.task?._shuttle_group) ? null : this.groupData?._id;
      // Fetches shuttle groups from the server
      this.shuttleGroups = await this.publicFunctions.getShuttleGroups(this.groupData?._workspace, groupId)
        .catch(() => {
          // If the function breaks, then catch the error and console to the application
          this.publicFunctions.sendError(new Error('Unable to connect to the server, please try again later!'));
        });
    }

    this.subSink.add(this.utilityService.currentGroupData.subscribe((res) => {
      if (JSON.stringify(res) != JSON.stringify({})) {

        // Assign the GroupData
        this.groupData = res;

        this.groupMembers = this.groupData._members.concat(this.groupData._admins);
        this.groupMembers = this.groupMembers.filter((member, index) => {
            return (this.groupMembers.findIndex(m => m._id == member._id) == index)
        });

        this.groupMembers.unshift({_id: 'all', first_name: 'All', last_name: 'members', email: ''});
      }
    }));

    if (this.postData?.task?._parent_task) {
      this.isChild = true;
    }

    if ((this.postData?.task?._dependency_task && this.postData?.task?._dependency_task?.length > 0)
        || (this.postData?.task?._dependent_child && this.postData?.task?._dependent_child?.length > 0)) {
      this.isDependent = true;
    }

    this.allocation = this.postData?.task?.allocation;

    this.parentTask = await this.isParent();

    this.getDependencyTask();
  }

  ngOnInit() {
    this.postService.getGroupTemplates(this.groupData?._id || this.postData?._group?._id || this.postData?._group).then(res => {
      this.groupTemplates = res['posts'];
    });
  }

  ngAfterViewInit() {
    if (this.itemValue == "")
      this.tasksList = []
      // Adding the service function to the subsink(), so that we can unsubscribe the observable when the component gets destroyed
      this.subSink.add(this.itemValueChanged
        .pipe(distinctUntilChanged(), debounceTime(500))
        .subscribe(async () => {
          // If value is null then empty the array
          if (this.itemValue == "" && this.dependencyItemValue == "") {
            this.tasksList = []
          } else {
            if (this.searchingOn === 'keyword') {
              this.tasksList = await this.postService.searchPosibleParents(this.groupData._id, this.postData._id, this.itemValue, 'subtask') || []
            } else {
              this.tasksList = await this.postService.searchPosibleParents(this.groupData._id, this.postData._id, this.dependencyItemValue, 'dependency') || []
            }

            //this.tasksList = await this.postService.getPosts(this.groupData._id, 'task') || []

            // Update the tasksList
            this.tasksList = Array.from(new Set(this.tasksList['posts']));

          }

          // Stop the loading state once the values are loaded
          this.isLoadingAction$.next(false);
        }));
  }

  /**
   * Unsubscribe all the observables on destroying the component
   */
  ngOnDestroy() {
    this.subSink.unsubscribe()
    this.isLoadingAction$.complete()
  }

  async onUserSelctionEmitter(userId:string){
    const selectedMemberId=userId;
    let assignees = [];

    if (selectedMemberId == 'all') {
      this.groupMembers.forEach((member)=> {
        if(member._id != 'all'){
          assignees.push(member._id);
        }
      });
    } else {
      assignees = [selectedMemberId];
    }

    this.utilityService.asyncNotification('Please wait we are cloning the task...', new Promise((resolve, reject) => {
      this.postService.cloneToAssignee(assignees, this.postData._id)
        .then((res) => {
          // Close the modal
          this.mdDialogRef.close();

          this.taskClonedEmitter.emit();
          resolve(this.utilityService.resolveAsyncPromise(`👍 Task cloned!`));
        })
        .catch((error) => {
          reject(this.utilityService.rejectAsyncPromise(`Error while cloning the task!`));
        });
    }));
  }

  async isParent() {
    let numSubtasks = 0;
    await this.postService.getSubTasksCount(this.postData._id)
      .then(res => numSubtasks = res['subtasksCount']);
    return (numSubtasks > 0);
  }

  saveTransferAction(action: string) {
    this.transferAction = action;
  }

  transferToGroup(group: string, section: any) {
    if (this.transferAction === 'copy') {
      this.copyToGroup(group, section);
    }
    if (this.transferAction === 'move') {
      this.moveToGroup(group, section);
    }

    this.saveTransferAction('');
  }

  async copyToGroup(group: string, section: any) {
    // Open the Confirm Dialog to ask for permission
    this.utilityService.getConfirmDialogAlert('Are you sure?', 'By doing this the task will be copied to the selected group!')
      .then(async (res) => {
        if (res.value) {
          await this.utilityService.asyncNotification('Please wait we are copy the task...', new Promise((resolve, reject) => {
            this.postService.transferToGroup(this.postData._id, group, section._id, this.groupData._id, this.userData._id, true).then((res) => {
              this.onTransferPost({ post: res['post'], isCopy: true });
              resolve(this.utilityService.resolveAsyncPromise(`👍 Task Copied!`));
            })
              .catch((error) => {
                reject(this.utilityService.rejectAsyncPromise(`Error while copying the task!`));
              });
          }));
        }
      });
  }

  async moveToGroup(group: string, section: any) {
    // Open the Confirm Dialog to ask for permission
    this.utilityService.getConfirmDialogAlert('Are you sure?', 'By doing this the task will be moved to the selected group!')
      .then(async (res) => {
        if (res.value) {
          await this.utilityService.asyncNotification('Please wait we are move the task...', new Promise((resolve, reject) => {
            this.postService.transferToGroup(this.postData._id, group, section._id, this.groupData._id, this.userData._id, false)
              .then((res) => {
                this.onTransferPost({ post: res['post'], isCopy: false, groupId: group });
                resolve(this.utilityService.resolveAsyncPromise(`👍 Task moved!`));
              })
              .catch((error) => {
                reject(this.utilityService.rejectAsyncPromise(`Error while moving the task!`));
              });
          }));
        }
      });
  }

  onTransferPost(data) {
    const post = data.post;
    const isCopy = data.isCopy;

    if (!isCopy) {
      // redirect the user to the post
      const groupId = data.groupId;

      // Close the modal
      this.mdDialogRef.close();

      // Set the Value of element selection box to be the url of the post
      if (post.type === 'task') {
        this._router.navigate(['/dashboard', 'work', 'groups', 'tasks'], { queryParams: { group: groupId, myWorkplace: false, postId: post._id } });
      } else {
        this._router.navigate(['/dashboard', 'work', 'groups', 'activity'], { queryParams: { group: groupId, myWorkplace: false, postId: post._id } });
      }
    }
  }

  /**
   * This function clears the list on the UI if the input changes accordingly
   * @param $event
   */
  modelChange($event: any) {
    this.itemValue = $event;
    this.tasksList = []
  }

  modelChangeForDependency($event: any) {
    this.dependencyItemValue = $event;
    this.tasksList = []
  }

  /**
   * This function observers on the change value of item
   * @param $event - value of item
   */
  onSearch($event: Event) {

    this.searchingOn = $event.target['id'];

    // Set loading state to be true
    this.isLoadingAction$.next(true);

    // Set the itemValueChange
    this.itemValueChanged.next($event);
  }

  async setParentTask(parentTaskId: string) {
    this.utilityService.getConfirmDialogAlert('Are you sure?', 'By doing this the task will change its parent task!')
      .then((res) => {
        if (res.value) {
          this.postService.setParentTask(this.postData._id, parentTaskId).then(res => {
            this.postData = res['post'];

            // Clear search input after assigning
            this.itemValue = '';

            // Close the list after assigning
            this.tasksList = [];

            this.parentTaskSelectedEmitter.emit(this.postData);
          });
        }
      });
  }

  async setDependencyTask(dependencyTaskId: string) {
    this.utilityService.getConfirmDialogAlert('Are you sure?', 'By doing this the task will change its dependency task!')
      .then((res) => {
        if (res.value) {
          this.postService.setDependencyTask(this.postData._id, dependencyTaskId).then(res => {
            this.postData = res['post'];
            let settings = { setDependency: "setDependency" }
            this.postData.settings = settings;
            // Clear search input after assigning
            // this.itemValue = '';
            this.dependencyItemValue = '';

            // Close the list after assigning
            this.tasksList = [];
            this.getDependencyTask();

            this.dependencyTaskSelectedEmitter.emit(this.postData);
          });
        }
      });
  }

  async getDependencyTask(){
    this.dependencyTask = [] ;

    this.tasks?.forEach(task => {

      if(typeof this.postData?.task?._dependency_task == 'object'){
        let isPushed = false;
        this.postData?.task?._dependency_task.forEach(dependecy => {
          if(dependecy == task._id && !isPushed){
            this.dependencyTask.push(task);
            isPushed = true;
          }
        });
      } else {
        if(this.postData?.task?._dependency_task == task._id){
          this.dependencyTask.push(task);
        }
      }

    });
  }

  async removeDependencyTask(index){

    this.utilityService.getConfirmDialogAlert('Are you sure?', 'By doing this the task will remove its dependency task!')
    .then((res) => {
      if (res.value) {
        this.postService.removeDependencyTask(this.postData._id, this.dependencyTask[index]._id).then(res => {
          this.postData = res['post'];
          let settings = { setDependency: "setDependency" }
          this.postData.settings = settings;
          // Clear search input after assigning
          // this.itemValue = '';
          this.dependencyItemValue = '';

          // Close the list after assigning
          this.tasksList = [];

          this.getDependencyTask();

          this.dependencyTaskSelectedEmitter.emit(this.postData);
        });
      }
    });
  }

  saveTemplateAction(action: string) {
    this.templateAction = action;
  }

  /**
   * Create a new task from a template
   */
  selectTemplate(templatePostId: string, templateName?: string) {
    if (this.templateAction == 'save') {
      this.utilityService.getConfirmDialogAlert('Are you sure?', 'By doing this the task will change the content of the template!')
        .then((res) => {
          if (res.value) {
            this.utilityService.asyncNotification('Please wait, while we are updating the template for you...', new Promise((resolve, reject) => {
              this.postService.overwriteTemplate(this.postData._id, templatePostId, templateName)
                .then((res) => {
                  const index = this.groupTemplates.findIndex(t => t._id == templatePostId);
                  if (index >= 0) {
                    this.groupTemplates[index] = res['post'];
                  }
                  resolve(this.utilityService.resolveAsyncPromise('Template updated!'))
                })
                .catch(() => reject(this.utilityService.rejectAsyncPromise('An unexpected error occured while updating the template, please try again!')))
            }))
          }
        });
    } else if (this.templateAction == 'delete') {
      this.utilityService.getConfirmDialogAlert('Are you sure?', 'By doing this the template will be deleted!')
        .then((res) => {
          if (res.value) {
            this.utilityService.asyncNotification('Please wait, while we are deleting the template for you...', new Promise((resolve, reject) => {
              this.postService.deletePost(templatePostId)
                .then((res) => {
                  this.groupTemplates.splice(this.groupTemplates.findIndex((t) => t._id === templatePostId), 1);
                  resolve(this.utilityService.resolveAsyncPromise('Template deleted!'))
                })
                .catch(() => reject(this.utilityService.rejectAsyncPromise('An unexpected error occured while deleting the template, please try again!')))
            }))
          }
        });
    } else {
      this.utilityService.getConfirmDialogAlert('Are you sure?', 'By doing this the task will change the content of the task!')
        .then((res) => {
          if (res.value) {
            this.utilityService.asyncNotification('Please wait, while we are updating the task for you...', new Promise((resolve, reject) => {
              this.postService.createTaskFromTemplate(templatePostId, this.postData._id)
                .then((res) => {
                  this.taskFromTemplateEmitter.emit(this.postData._id);
                  resolve(this.utilityService.resolveAsyncPromise('Task updated!'))
                })
                .catch(() => reject(this.utilityService.rejectAsyncPromise('An unexpected error occured while updating the task, please try again!')))
            }))
          }
        });
    }

    this.saveTemplateAction('');
  }

  /**
   * This function creates a new template from the current post
   */
  async createTemplate() {
    const { value: value } = await this.openModal('Create Template');
    if (value) {
      this.utilityService.asyncNotification('Please wait, while we are creating the template for you...', new Promise((resolve, reject) => {
        this.postService.createTemplate(this.postData._id, this.groupData._id, value)
          .then((res) => {
            this.groupTemplates.unshift(res['post']);
            this.groupTemplates.sort((t1, t2) => (t1.task.template_name > t2.task.template_name) ? 1 : -1);
            resolve(this.utilityService.resolveAsyncPromise('Template created!'))
          })
          .catch(() => reject(this.utilityService.rejectAsyncPromise('An unexpected error occured while creating the template, please try again!')))
      }))
    } else if(value == ''){
      this.utilityService.warningNotification('Template name can\'t be empty!');
    }
  }

  /**
   * This function opens the Swal modal to create template
   * @param title
   * @param imageUrl
   */
  openModal(title: string) {
    return this.utilityService.getSwalModal({
      title: title,
      input: 'text',
      inputPlaceholder: 'Try to add a name',
      inputAttributes: {
        maxlength: 30,
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      confirmButtonText: title,
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      cancelButtonColor: '#d33',
    })
  }

  allocationChange(event) {

    const allocation = event.target.value;

    this.utilityService.asyncNotification('Please wait we are saving the task...', new Promise((resolve, reject) => {
      this.postService.saveAllocation(allocation, this.postData?._id)
        .then((res) => {
          this.allocation = allocation;
          this.taskAllocationEmitter.emit(allocation);
          resolve(this.utilityService.resolveAsyncPromise(`👍 Task saved!`));
        })
        .catch((error) => {
          reject(this.utilityService.rejectAsyncPromise(`Error while saving the task!`));
        });
    }));
  }

  transformToNorthStart() {
    this.isNorthStar = !this.isNorthStar;
    this.transformIntoNorthStarEmitter.emit(this.isNorthStar);
  }

  transformToIdea() {
    this.isIdea = !this.isIdea;
    this.transformIntoIdeaEmitter.emit(this.isIdea);
  }

  transformToMilestone() {
    this.isMilestone = !this.isMilestone;
    this.transformIntoMilestoneEmitter.emit(this.isMilestone);
  }

  async shuttleTask(groupId) {
    this.utilityService.asyncNotification('Please wait we are saving the task...', new Promise((resolve, reject) => {
      this.postService.selectShuttleGroup(this.postData?._id, groupId)
        .then(async (res) => {
          this.postData = res['post'];
          this.shuttleGroupEmitter.emit({
              shuttle_group: (this.postData?.task?._shuttle_group?._id || this.postData?.task?._shuttle_group),
              shuttle_section: this.postData?.task?._shuttle_section,
              shuttle_type: this.postData?.task?.shuttle_type,
              shuttle_status: this.postData?.task?.shuttle_status
            });
          this.postData.task._shuttle_group = this.postData?.task?._shuttle_group?._id;
          resolve(this.utilityService.resolveAsyncPromise(`👍 Task saved!`));
        })
        .catch((error) => {
          reject(this.utilityService.rejectAsyncPromise(`Error while saving the task!`));
        });
    }));
  }
}
