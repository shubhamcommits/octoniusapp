import { Component, Injector, Input, OnChanges, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { PostService } from 'src/shared/services/post-service/post.service';
import { UserService } from 'src/shared/services/user-service/user.service';

@Component({
  selector: 'app-custom-field-statistics-card',
  templateUrl: './custom-field-statistics-card.component.html',
  styleUrls: ['./custom-field-statistics-card.component.scss']
})
export class CustomFieldStatisticsCardComponent implements OnChanges {

  @Input() period;
  @Input() group: string;
  @Input() customField: any;

  // Current Workspace Data
  //workspaceData: any;

  tasks = [];

  numDoneTasks = 0;
  statsDoneTasks = 0;
  numInProgressTasks = 0;
  statsInProgressTasks = 0;

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector)

  constructor(
    private postService: PostService,
    private injector: Injector
  ) { }

  async ngOnChanges() {
    await this.getTasks();

    await this.calculateTasksStats();
  }

  async getTasks() {
    if (this.group) {
      await this.postService.getGroupPosts(this.group, 'task', this.period, false)
      .then((res) => {
        this.tasks = res['posts'];
      });
    }
  }

  async calculateTasksStats() {
    this.tasks.forEach(task => {
      if (task.task.status == 'done') {
        this.numDoneTasks++;
        this.statsDoneTasks += (task.task.custom_fields[this.customField.name] && !isNaN(task.task.custom_fields[this.customField.name]))
          ? +task.task.custom_fields[this.customField.name]
          : 0;
      }
      if (task.task.status == 'in progress') {
        this.numInProgressTasks++;
        this.statsInProgressTasks += (task.task.custom_fields[this.customField.name] && !isNaN(task.task.custom_fields[this.customField.name]))
          ? +task.task.custom_fields[this.customField.name]
          : 0;
      }
    });
  }
}
