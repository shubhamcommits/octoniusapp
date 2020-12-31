import { AfterViewInit, Component, EventEmitter, Injector, Input, OnDestroy, OnChanges, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';
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
export class TaskActionsComponent implements OnChanges, AfterViewInit, OnDestroy {

  @Input() postData: any;
  @Input() groupData: any;
  @Input() userData: any;

  @Output() parentTaskSelectedEmitter = new EventEmitter();

  userGroups = [];
  transferAction = '';

  parentTask: boolean = false;

  tasksList: any = [];
  searchingOn: 'keyword';
  // Item value variable mapped with search field
  itemValue: string;
  dependencyItemValue: string;

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
      await this.publicFunctions.getUserGroups(this.groupData._workspace, this.userData._id)
        .then((groups: any) => {
          groups.forEach(async group => {
            group.sections = await this.publicFunctions.getAllColumns(group._id);
            if (group.sections) {
              group.sections.sort((s1, s2) => (s1.title > s2.title) ? 1 : -1);
              this.utilityService.removeDuplicates(group.sections, 'title').then((sections)=>{
                group.sections = sections;
              });
            }
            if (group._id != this.groupData._id && group.sections) {
              this.userGroups.push(group);
            }
          });
          this.userGroups.sort((g1, g2) => (g1.group_name > g2.group_name) ? 1 : -1);
          this.utilityService.removeDuplicates(this.userGroups, '_id').then((groups)=>{
            this.userGroups = groups;
          });
        })
        .catch(() => {
          // If the function breaks, then catch the error and console to the application
          this.publicFunctions.sendError(new Error('Unable to connect to the server, please try again later!'));
        });
    }

    this.parentTask = await this.isParent();
  }

  ngAfterViewInit() {
    if (this.itemValue == "")
    this.tasksList = []
    // Adding the service function to the subsink(), so that we can unsubscribe the observable when the component gets destroyed
    this.subSink.add(this.itemValueChanged
      .pipe(distinctUntilChanged(), debounceTime(500))
      .subscribe(async () => {
        // If value is null then empty the array
        if (this.itemValue == "" ) {
          this.tasksList = []
        } else {
          if (this.searchingOn === 'keyword') {
            this.tasksList = await this.postService.searchPosibleParents(this.groupData._id, this.postData._id, this.itemValue) || []
          } else {
            this.tasksList = await this.postService.searchPosibleParents(this.groupData._id, this.postData._id, this.dependencyItemValue) || []
          }
          
          //this.tasksList = await this.postService.getPosts(this.groupData._id, 'task') || []

          // Update the tasksList
          this.tasksList = Array.from(new Set(this.tasksList['posts']))
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
    this.transferAction = '';
  }

  async copyToGroup(group: string, section: any) {
    // Open the Confirm Dialog to ask for permission
    this.utilityService.getConfirmDialogAlert('Are you sure?', 'By doing this the task will be copied to the selected group!')
      .then(async (res) => {
        if (res.value) {
          await this.utilityService.asyncNotification('Please wait we are copy the task...', new Promise((resolve, reject) => {
            this.postService.transferToGroup(this.postData._id, group, section.title, this.groupData._id, this.userData._id, true).then((res) => {
              this.onTransferPost({post: res['post'], isCopy: true});
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
            this.postService.transferToGroup(this.postData._id, group, section.title, this.groupData._id, this.userData._id, false)
              .then((res) => {
                this.onTransferPost({post: res['post'], isCopy: false, groupId: group});
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

    if (this.searchingOn === 'keyword') {
      this.itemValue = $event;
    } else {
      this.dependencyItemValue = $event;  
    } 
    this.tasksList = []
  }

  /**
   * This function observers on the change value of item
   * @param $event - value of item
   */
  onSearch($event: Event) {

    // Set loading state to be true
    this.isLoadingAction$.next(true);

    // Set the itemValueChange
    this.itemValueChanged.next($event);
    this.searchingOn = $event['path'][0]['attributes'][3]['nodeValue'];
  }

  async setParentTask(parentTaskId: string) {
    this.utilityService.getConfirmDialogAlert('Are you sure?', 'By doing this the task will change its parent task!')
      .then((res) => {
        if (res.value) {
          this.postService.setParentTask(this.postData._id, parentTaskId).then(res => {
            this.postData =  res['post'];

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
            this.postData =  res['post'];

            // Clear search input after assigning
            // this.itemValue = '';
            this.dependencyItemValue = '';

            // Close the list after assigning
            this.tasksList = [];

            this.parentTaskSelectedEmitter.emit(this.postData);
          });
        }
      });
  }

}
