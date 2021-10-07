import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import moment from 'moment/moment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-done-tasks-kanban-view',
  templateUrl: './done-tasks-kanban-view.component.html',
  styleUrls: ['./done-tasks-kanban-view.component.scss']
})
export class DoneTasksKanbanViewComponent implements OnInit {

  @Input() columns = [];
  @Input() tasks = [];
  @Input() groupData;
  @Input() userData;
  @Input() isIdeaModuleAvailable;

  @Output() closeModalEvent = new EventEmitter();
  @Output() deleteEvent = new EventEmitter();

  showDoneTasks = false;

  // BASE URL OF THE APPLICATION
  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  constructor(public utilityService: UtilityService) { }

  ngOnInit() {
  }

  /**
   * This function is responsible for opening a fullscreen dialog to edit a task
   */
  openFullscreenModal(postData: any): void {
    const dialogRef = this.utilityService.openCreatePostFullscreenModal(postData, this.userData, this.groupData, this.isIdeaModuleAvailable, this.columns);

    if (dialogRef) {
      const deleteEventSubs = dialogRef.componentInstance.deleteEvent.subscribe((data) => {
        this.deleteEvent.emit(data);
      });
      const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe((data) => {
        this.closeModalEvent.emit(data);
      });
      const parentAssignEventSubs = dialogRef.componentInstance.parentAssignEvent.subscribe((data) => {
        this.deleteEvent.emit(data._id);
      });
      dialogRef.afterClosed().subscribe(result => {
        closeEventSubs.unsubscribe();
        deleteEventSubs.unsubscribe();
        parentAssignEventSubs.unsubscribe();
      });
    }
  }

}
