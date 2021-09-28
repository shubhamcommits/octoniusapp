import { Component, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import moment from 'moment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';

@Component({
  selector: 'app-kanban-task-card',
  templateUrl: './kanban-task-card.component.html',
  styleUrls: ['./kanban-task-card.component.scss']
})
export class KanbanTaskCardComponent {

  @Input() isProject: Boolean;
  @Input() isDelay: Boolean;
  @Input() task: any;
  @Input() isIdeaModuleAvailable;
  @Input() groupId: string;


  // Current User Data
  userData: any = {};
  groupData: any = {};

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    private injector: Injector
    ) {}

  async ngOnInit() {
    this.userData = await this.publicFunctions.getCurrentUser();
    this.groupData = await this.publicFunctions.getCurrentGroup();
  }

  /**
   * This function checks the task board if a particular task is overdue or not
   * @param taskPost
   * And applies the respective ng-class
   *
   * -----Tip:- Don't make the date functions asynchronous-----
   *
   */
  checkOverdue(taskPost: any) {
    return this.publicFunctions.checkOverdue(taskPost);
  }

  formateDate(date: any, format: string) {
    return date ? moment.utc(date).format(format) : '';
  }

  getPriorityClass(priority: string) {
    return 'label-priority ' + priority.toLocaleLowerCase();
  }

  getTaskClass(status: string, isNorthStar: boolean, isMilestone: boolean, isShuttleTask: boolean) {
    let taskClass = '';
    if (isShuttleTask) {
      const shuttleIndex = (this.task.task.shuttles) ? this.task.task.shuttles.findIndex(s => (s._shuttle_group._id || s._shuttle_group) == this.groupId) : -1;
      const shuttleStatus = (shuttleIndex >= 0) ? this.task.task.shuttles[shuttleIndex].shuttle_status : status;
      if (shuttleStatus === 'to do') {
        taskClass = 'status-todo';
      } else if (shuttleStatus === 'in progress') {
        taskClass = 'status-inprogress';
      } else if (shuttleStatus === 'done') {
        taskClass = 'status-done';
      }
    } else {
      if (status === 'to do') {
        taskClass = 'status-todo';
      } else if (status === 'in progress') {
        taskClass = 'status-inprogress';
      } else if (status === 'done') {
        taskClass = 'status-done';
      }
    }

    if (isMilestone) {
      taskClass = taskClass + ' milestone'
    }

    return (isNorthStar) ? taskClass + ' north-star' : taskClass;
  }

  displayCustomField(cfName: string) {
    const index = this.groupData?.custom_fields?.findIndex(cf => cf.name == cfName);
    return this.groupData
      && this.groupData?.custom_fields
      && this.groupData?.custom_fields[index]
      && this.groupData?.custom_fields[index]?.display_in_kanban_card;
  }

  getCustomFieldBadgeColor(cfName: string) {
    const index = this.groupData?.custom_fields?.findIndex(cf => cf.name == cfName);
    if (index >= 0) {
      const cf = this.groupData?.custom_fields[index];
      if (cf && cf.badge_color) {
        return cf.badge_color;
      }
    }
    return '#e4edf8';
  }
}
