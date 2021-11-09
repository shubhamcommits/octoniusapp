import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-subtasks',
  templateUrl: './subtasks.component.html',
  styleUrls: ['./subtasks.component.scss']
})
export class SubtasksComponent implements OnInit {

  @Input() subtasks: any[] = [];

  @Input() groupData: any;
  @Input() userData: any;
  @Input() subtask: any;
  @Input() parentId: any;

  @Output() openSubtaskEmitter = new EventEmitter();

  percentageSubtasksCompleted = 0;
  completitionPercentageClass: string = 'badge';

  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  constructor() { }

  ngOnInit() {
    let doneTasksCount = 0;
    this.subtasks.forEach(subtask => {
      if (subtask.task.status === 'done') doneTasksCount++;
    });

    const percentageDone = ((doneTasksCount)*100)/(this.subtasks.length);
    this.percentageSubtasksCompleted = Math.round(percentageDone);

    if (this.percentageSubtasksCompleted === 0) {this.completitionPercentageClass += " badge_to_do"}
    else if (this.percentageSubtasksCompleted === 100) {this.completitionPercentageClass += " badge_done"}
    else {this.completitionPercentageClass += " badge_in_progress"}
  }

  /**
   * This function is responsible for fetching the post
   * @param post
   * @param column
   */
  newSubtaskEvent(post: any) {

    post.canEdit = true;

    // Adding the post to column
    this.subtasks.push(post);
  }

  openSubtask(task: any) {
    this.openSubtaskEmitter.emit(task);
  }

  getAssigneeProfilePicUrl(assignee) {

    if(!assignee) {
      return 'assets/images/user.png';
    }

    return this.baseUrl + '/' + assignee.profile_pic;
  }
}
