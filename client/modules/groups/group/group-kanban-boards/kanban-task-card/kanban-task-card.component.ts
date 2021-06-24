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

  // Current User Data
  userData : any = {};

  // Today's date object
  today = moment().startOf('day').format('YYYY-MM-DD');

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    private injector: Injector
    ) {}

  async ngOnInit() {
    this.userData = await this.publicFunctions.getCurrentUser();
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
    return (taskPost.status != 'done') &&
      (taskPost.task && moment.utc(taskPost.task.due_to).format('YYYY-MM-DD') < this.today);
  }

  formateDate(date: any, format: string) {
    return date ? moment.utc(date).format(format) : '';
  }

  getPriorityClass(priority: string) {
    return 'label-priority ' + priority.toLocaleLowerCase();
  }

  getTaskClass(status, isNorthStar, isMilestone) {
    let taskClass = '';
    if (status === 'to do') {
      taskClass = 'status-todo';
    } else if (status === 'in progress') {
      taskClass = 'status-inprogress';
    } else if (status === 'done') {
      taskClass = 'status-done';
    }

    if (isMilestone) {
      taskClass = taskClass + ' milestone'
    }

    return (isNorthStar) ? taskClass + ' north-star' : taskClass;
  }
}
