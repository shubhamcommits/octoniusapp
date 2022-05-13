import { Component, OnInit, Input, Injector } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { PostService } from 'src/shared/services/post-service/post.service';

@Component({
  selector: 'app-section-status-card',
  templateUrl: './section-status-card.component.html',
  styleUrls: ['./section-status-card.component.scss']
})
export class SectionStatusCardComponent implements OnInit {

  groupData;

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  sections: any = [];
  tasks: any = [];

  constructor(
    private postService: PostService,
    private injector: Injector
  ) { }

  async ngOnInit() {

    // Fetch current group details
    this.groupData = await this.publicFunctions.getCurrentGroupDetails();

    /**
     * Here we fetch all the columns available in a group, and if null we initialise them with the default one
     */
    this.sections = await this.publicFunctions.getAllColumns(this.groupData?._id);

    /**
     * Adding the property of tasks in every column
     */
    this.sections?.forEach((section: any) => {
      section.percentage = 0;
      section.numTasks = 0;
      section.allocation = 0;
      section.cost = 0;
    });

    // Fetch all the tasks posts from the server
    this.tasks = await this.publicFunctions.getPosts(this.groupData?._id, 'task');

    /**
     * Calculate the statistics per section
     */
    this.calculateStatistics(this.sections, this.tasks);
  }

  /**
   * This Function is responsible for alculating the statistics per sections
   * @param sections
   * @param tasks
   */
  calculateStatistics(sections: any, tasks: any) {

    sections?.forEach(async (section: any) => {
      // Feed the tasks into that column which has matching property _column with the column title
      const sectionTasks = tasks
        .filter((post: any) => post?.task?.hasOwnProperty(
          '_column') === true &&
          post?.task?._column != null && post?.task?._column?.title === section['title']
        );
      let totalTasks = sectionTasks;

      await sectionTasks.forEach(async task => {
        this.postService.getSubTasks(task._id).then((res) => {
          const subtasks = res['subtasks'];

          if (subtasks && subtasks.length > 0) {
            totalTasks = totalTasks.concat(subtasks);
          }
        });

        // Total tasks in the section (with subtasks)
        section.numTasks = totalTasks.length;

        // Calculate the percentage of done tasks
        const doneTasks = totalTasks.filter((task) => task.task.status.toLowerCase() === 'done').length;
        section.percentage = (totalTasks.length > 0) ? (doneTasks*100/totalTasks.length) : 100;

        // Calculate the allocation of all tasks in the section (with subtasks)
        section.allocation = totalTasks
          .map(task => (task.task.allocation || 0))
          .reduce((t1, t2) => {
            return t1 + t2;
          });

        // Calculate the cost of the section (with subtasks)
        totalTasks.forEach(task => {
          let memberFare = 1
          if (this.groupData
              && task?._assigned_to?.length == 1
              && this.groupData.members_fares
              && this.groupData.members_fares[task._assigned_to[0]]) {
            memberFare = this.groupData?.members_fares[task._assigned_to[0]];
          }
          section.cost += (task.task.allocation || 0) * memberFare;
        });
      });
    });
  }

}
