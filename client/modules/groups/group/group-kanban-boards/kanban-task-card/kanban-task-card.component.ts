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
 
  @Input() columnsList : string;

  // Current User Data
  userData : any = {};

  @Input() columns;

  // Task Posts array variable
  @Input() tasks: any;
  @Input() task: any;

  // Fetch groupId from router snapshot
  groupId = this.router.snapshot.queryParamMap.get('group');
  @Input() sortingBit: String

  @Output() taskClonnedEvent = new EventEmitter();

  // Today's date object
  today = moment().startOf('day').format('YYYY-MM-DD');

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    private router: ActivatedRoute,
    private injector: Injector) {}
 
    async ngOnInit() {
      this.userData = await this.publicFunctions.getCurrentUser();
    }
    /**
   * This function is responsible for opening a fullscreen dialog to edit a task
   */
    async openFullscreenModal(postData: any): Promise<void> {
      
      this.columns = this.columnsList;
      this.tasks = this.columns[0].tasks;

      const dialogRef = this.utilityService.openCreatePostFullscreenModal(postData, this.userData, this.groupId, this.columns,this.tasks);
      const deleteEventSubs = dialogRef.componentInstance.deleteEvent.subscribe((data) => {
        this.onDeleteEvent(data);
        this.sorting();
      });
      const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe((data) => {
        this.updateTask(data);
        this.sorting();
      });
      const parentAssignEventSubs = dialogRef.componentInstance.parentAssignEvent.subscribe((data) => {
        this.onDeleteEvent(data._id);
        this.sorting();
      });
      const taskClonnedEventSubs = dialogRef.componentInstance.taskClonnedEvent.subscribe((data) => {
        this.onTaskClonned(data);
        this.sorting();
      });
  
  
      dialogRef.afterClosed().subscribe(result => {
        closeEventSubs.unsubscribe();
        deleteEventSubs.unsubscribe();
        parentAssignEventSubs.unsubscribe();
        taskClonnedEventSubs.unsubscribe();
      });
    }

    onDeleteEvent(id) {
      this.columns.forEach((col, indexColumn) => {
        // Find the index of the tasks inside the column
        const indexTask = col.tasks.findIndex((task: any) => task._id === id);
        if (indexTask !== -1) {
          this.columns[indexColumn].tasks.splice(indexTask, 1);
          return;
        }
      });
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

  isDelay(realDueDate: any, dueDate: any) {
    return moment(realDueDate).isAfter(moment(dueDate), 'day');
  }

  getPriorityClass(priority: string) {
    return 'label-priority ' + priority.toLocaleLowerCase();
  }

  
  async sorting() {

    if (this.sortingBit == 'due_date' || this.sortingBit == 'none') {
      for (let index = 0; index < this.columns.length; index++) {
        let task = this.columns[index].tasks;
        task.sort((t1, t2) => {
          if (t1.task?.due_to && t2.task?.due_to) {
            if (moment.utc(t1.task?.due_to).isBefore(t2.task?.due_to)) {
              return this.sortingBit == 'due_date' ? -1 : 1;
            } else {
              return this.sortingBit == 'due_date' ? 1 : -1;
            }
          } else {
            if (t1.task?.due_to && !t2.task?.due_to) {
              return -1;
            } else if (!t1.task?.due_to && t2.task?.due_to) {
              return 1;
            }
          }

        })
        this.columns[index].tasks = task;
      }
    } else if (this.sortingBit == 'priority') {
      for (let index = 0; index < this.columns.length; index++) {
        let task = this.columns[index].tasks;
        task.sort((t1, t2) => {
          return (t1?.task?.custom_fields && t2?.task?.custom_fields)
            ? (((t1?.task?.custom_fields['priority'] == 'High' && t2?.task?.custom_fields['priority'] != 'High') || (t1?.task?.custom_fields['priority'] == 'Medium' && t2?.task?.custom_fields['priority'] == 'Low'))
              ? -1 : (((t1?.task?.custom_fields['priority'] != 'High' && t2?.task?.custom_fields['priority'] == 'High') || (t1?.task?.custom_fields['priority'] == 'Low' && t2?.task?.custom_fields['priority'] == 'Medium'))
                ? 1 : 0))
            : ((t1?.task?.custom_fields && !t2?.task?.custom_fields)
              ? -1 : ((!t1?.task?.custom_fields && t2?.task?.custom_fields))
                ? 1 : 0);
        });
        this.columns[index].tasks = task;
      }
    } else if (this.sortingBit == 'tags') {
      for (let index = 0; index < this.columns.length; index++) {
        let task = this.columns[index].tasks;
        task.sort((t1, t2) => {
          if (t1?.tags.length > 0 && t2?.tags.length > 0) {
            const name1 = t1?.tags[0]?.toLowerCase();
            const name2 = t2?.tags[0]?.toLowerCase();
            if (name1 > name2) { return 1; }
            if (name1 < name2) { return -1; }
            return 0;
          } else {
            if (t1?.tags.length > 0 && t2?.tags.length == 0) {
              return -1;
            } else if (t1?.tags.length == 0 && t2?.tags.length > 0) {
              return 1;
            }
          }
        });
        this.columns[index].tasks = task;
      }
    } else if (this.sortingBit == 'status') {

      for (let index = 0; index < this.columns.length; index++) {
        let task = this.columns[index].tasks;
        task.sort((t1, t2) => {
          return (t1?.task?.status && t2?.task?.status)
            ? (((t1?.task?.status == 'to do' && t2?.task?.status != 'to do') || (t1?.task?.status == 'in progress' && t2?.task?.status == 'done'))
              ? -1 : (((t1?.task?.status != 'to do' && t2?.task?.status == 'to do') || (t1?.task?.status == 'done' && t2?.task?.status == 'in progress'))
                ? 1 : 0))
            : ((t1?.task?.status && !t2?.task?.status)
              ? -1 : ((!t1?.task?.status && t2?.task?.status))
                ? 1 : 0);
        });
        this.columns[index].tasks = task;
      }
    } else if(this.sortingBit == 'reverse'){
      this.columns.forEach(column => {
        column.tasks.reverse();
      });
    } else if (this.sortingBit == 'invert'){
      this.columns.forEach(column => {
        column.tasks.reverse();
      });
    }
  }

   /**
   * This function is responsible for updating the task in the UI
   * @param post - post
   */
    updateTask(post: any) {
      this.columns.forEach((col, indexColumn) => {
        // Find the index of the tasks inside the column
        const indexTask = col.tasks.findIndex((task: any) => task._id === post._id);
        if (indexTask != -1) {
          if (col._id == (post.task._column._id || post.task._column)) {
            // update the tasks from the array
            this.columns[indexColumn].tasks[indexTask] = post;
          } else {
            let indexNewColumn = this.columns.findIndex((column: any) => column._id == (post.task._column._id || post.task._column));
            if (indexNewColumn != -1) {
              this.columns[indexNewColumn].tasks.unshift(post);
              this.columns[indexColumn].tasks.splice(indexTask, 1);
            }
          }
          // Find the hightes due date on the tasks of the column
          col.real_due_date = moment(Math.max(...col.tasks.map(post => moment(post.task.due_to))));
  
          // Calculate number of done tasks
          col.numDoneTasks = col.tasks.filter((post) => post?.task?.status?.toLowerCase() == 'done').length;
  
          return;
        }
      });
  
      this.sorting();
    }
  
    
  onTaskClonned(data) {
    this.taskClonnedEvent.emit(data);
  }
 
}
