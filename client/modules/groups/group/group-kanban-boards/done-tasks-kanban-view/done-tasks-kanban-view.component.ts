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

  @Output() closeModalEvent = new EventEmitter();

  collapse = true;

  // BASE URL OF THE APPLICATION
  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  constructor(public utilityService: UtilityService) { }

  ngOnInit() {
  }

  /**
   * This function is responsible for opening a fullscreen dialog to edit a task
   */
  openFullscreenModal(postData: any): void {
    const dialogRef = this.utilityService.openCreatePostFullscreenModal(postData, this.userData, postData._group._id, this.columns);

    const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe((data) => {
      this.closeModalEvent.emit();
    });
    dialogRef.afterClosed().subscribe(result => {
      closeEventSubs.unsubscribe();
    });
  }

}
