import { Component, OnChanges, Input, EventEmitter, Output } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-done-tasks-list-view',
  templateUrl: './done-tasks-list-view.component.html',
  styleUrls: ['./done-tasks-list-view.component.scss']
})
export class DoneTasksListViewComponent implements OnChanges {

  @Input() tasks = [];
  @Input() sections = [];
  @Input() section;
  @Input() groupData;
  @Input() userData;
  @Input() customFieldsToShow = [];
  @Input() displayedColumns = [];
  @Input() isIdeaModuleAvailable;

  @Output() closeDoneTaskModalEvent = new EventEmitter();

  collapse = true;

  // BASE URL OF THE APPLICATION
  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  constructor(public utilityService: UtilityService) { }

  ngOnChanges() {
    this.initTable();
  }

  initTable() {
    this.tasks = [...this.tasks];
  }

  /**
   * This function is responsible for opening a fullscreen dialog to edit a task
   */
  openFullscreenModal(postData: any): void {
    const canOpen = !this.groupData?.enabled_rights || postData?.canView || postData?.canEdit;
    const dialogRef = this.utilityService.openCreatePostFullscreenModal(postData._id, this.groupData._id, this.isIdeaModuleAvailable, canOpen, this.sections);

    if (dialogRef) {
      const deleteEventSubs = dialogRef.componentInstance.deleteEvent.subscribe((data) => {
        this.onDeleteEvent(data);
      });
      const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe((data) => {
        this.updateTask(data);
        this.closeDoneTaskModalEvent.emit(data);
      });
      const parentAssignEventSubs = dialogRef.componentInstance.parentAssignEvent.subscribe((data) => {
        this.onDeleteEvent(data._id);
      });
      dialogRef.afterClosed().subscribe(result => {
        closeEventSubs.unsubscribe();
        deleteEventSubs.unsubscribe();
        parentAssignEventSubs.unsubscribe();
      });
    }
  }

  onDeleteEvent(id) {
    // Find the index of the tasks inside the column
    const indexTask = this.tasks.findIndex((task: any) => task._id === id);
    if (indexTask !== -1) {
      this.tasks.splice(indexTask, 1);
      this.initTable();
      return;
    }
  }

  /**
   * This function is responsible for updating the task in the UI
   * @param post - post
   */
  updateTask(post: any) {
    // Find the index of the tasks inside the column
    const indexTask = this.tasks.findIndex((task: any) => task._id === post._id);
    if (this.section._id != (post.task._column._id || post.task._column)) {
      // this.tasks.splice(indexTask, 1);
      this.closeDoneTaskModalEvent.emit(post);
    } else {
      if (post.task.status !== 'done') {
        // this.tasks.splice(indexTask, 1);
        this.closeDoneTaskModalEvent.emit(post);
      } else {
        // update the tasks from the array
        this.tasks[indexTask]= post;
      }
    }
    this.initTable();
  }
}
