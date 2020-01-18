import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { GroupService } from '../../../../../shared/services/group.service';
import { SnotifyService } from 'ng-snotify';
import { environment } from '../../../../../../environments/environment';
import { ReplaySubject } from 'rxjs/internal/ReplaySubject';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';

@Component({
  selector: 'app-group-kanban-task-assignment',
  templateUrl: './group-kanban-task-assignment.component.html',
  styleUrls: ['./group-kanban-task-assignment.component.scss']
})
export class GroupKanbanTaskAssignmentComponent implements OnInit {

  constructor(private groupService: GroupService,
    private snotifyService: SnotifyService) { }

  @Input('task') task;
  @Input('groupData') groupData;
  @Input('isModalView') isModalView;
  @Output() updatedTask = new EventEmitter();

  // Users in a group
  usersInGroup = [];

  // Environment Variables
  BASE_URL = environment.BASE_URL;

  // Unsubscribe the Data
  private unSubscribe$: ReplaySubject<boolean> = new ReplaySubject(1);

  ngOnInit() {
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.unSubscribe$.next(true);
    this.unSubscribe$.complete();
  }

  /**
   * This function searches for the member present in the group
   * @param $event 
   * Makes a HTTP GET Request to retrieve the results
   */
  async onSearchMember($event) {
    return new Promise((resolve, reject) => {
      if ($event.target.value.length == 0)
        resolve([]);
      else {
        this.groupService.searchGroupUsers(this.groupData._id, $event.target.value)
          .pipe(takeUntil(this.unSubscribe$))
          .subscribe((res) => {
            // console.log(res);
            this.usersInGroup = res['users'];
            resolve(res['users']);
          }, (err) => {
            this.snotifyService.error('Unable to fetch the users, please try again!');
            console.log('Error occured while searching the group members', err);
            reject([]);
          })
      }
    })
  }

  /**
   * This function changes the task assignee 
   * @param task - data of current task
   * @param user - data of assignee
   * Makes a HTTP PUT request
   */
  async onSelectUser(task, user) {
    // console.log(task, user, assignee);
    const assigneeId = {
      assigneeId: user._id
    }
    return new Promise((resolve, reject) => {
      this.groupService.changeTaskAssignee(task._id, assigneeId)
        .pipe(takeUntil(this.unSubscribe$))
        .subscribe((res) => {
          this.task = res['post'];
          this.updatedTask.emit({
            task: res['post']
          })
          this.snotifyService.success('Task reassigned successfully!');
          resolve();
        }, (err) => {
          this.snotifyService.error('Unepxected error occured while re-assigning, please try again!');
          console.log('Error occured while searching the group members', err);
          reject();
        })
    })
  }

}
