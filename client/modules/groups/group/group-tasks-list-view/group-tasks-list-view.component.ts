import { Component, OnChanges, Input, Injector, ViewChild } from '@angular/core';
import moment from 'moment/moment';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { MatDialog, MatAccordion } from '@angular/material';
import { ColumnService } from 'src/shared/services/column-service/column.service';

@Component({
  selector: 'app-group-tasks-list-view',
  templateUrl: './group-tasks-list-view.component.html',
  styleUrls: ['./group-tasks-list-view.component.scss']
})
export class GroupTasksListViewComponent implements OnChanges {

  // Current Group Data
  @Input() groupData: any;
  // Current User Data
  @Input() userData: any;
  @Input() sections: any;
  // Task Posts array variable
  @Input() tasks: any;
  @Input() customFields: any;

  @Input() isAdmin = false;

  @ViewChild(MatAccordion, { static: true }) accordion: MatAccordion;

  // customFieldsToShow: any[] = [];

  // Today's date object
  today = moment().local().startOf('day').format('YYYY-MM-DD');

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  // Fetch groupId from router snapshot
  groupId = this.router.snapshot.queryParamMap.get('group');

  // Base URL of the uploads
  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  // Property to know the selected field to add as column
  field: string;

  newColumnSelected;

  displayedColumns = ['title', 'tags', 'asignee', 'due_to', 'nsPercent', 'star'];

  constructor(
      public utilityService: UtilityService,
      private injector: Injector,
      private router: ActivatedRoute,
      public dialog: MatDialog
    ) {}

  async ngOnChanges() {
    this.initSections();
  }

  initSections() {
    this.sections.forEach( section => {
      let tasks = [];
      let doneTasks = [];

      // Filtering done tasks
      if(section.tasks.done !== undefined){
        section.tasks.done.forEach(doneTask =>{
          if(doneTask.bars !== undefined && doneTask.bars.length > 0){
              doneTask.bars.forEach(bar => {
                if(bar.tag_members.includes(this.userData._id) || this.userData.role !== "member") {
                  doneTasks.push(doneTask);
                }
              });
            } else {
              doneTasks.push(doneTask);
            }
        });
      }

      // Filtering other tasks
      section.tasks.forEach( task => {
        if(task.bars !== undefined && task.bars.length > 0){
          task.bars.forEach(bar => {
            if(bar.tag_members.includes(this.userData._id) || this.userData.role !== "member") {
              tasks.push(task);
            }
          });
        } else {
          tasks.push(task);
        }
      });
      section.tasks = tasks;
      section.tasks.done = doneTasks;
    });
  }

  /**
   * This function is responsible for fetching the post
   * @param post
   * @param section
   */
  getPost(post: any, section: any) {
    // Adding the post to column
    section.tasks.unshift(post);

    const doneTasks = [...section.tasks['done']];
    section.tasks = [...section.tasks];
    section.tasks['done'] = doneTasks;
  }

  /**
   * This function recieves the output from the other component for creating column
   * @param column
   */
  addSection(section: any) {

    // Find the index of the column to check if the same named column exist or not
    let index = this.sections.findIndex((sec: any) => sec.title.toLowerCase() === section.title.toLowerCase())

    // If index is found, then throw error notification
    if (index != -1) {
      this.utilityService.warningNotification('Column with the same title aready exist, please try with different name!')
    }

    // If not found, then push the element
    else {

      // Create the Column asynchronously
      this.createNewSection(this.groupId, section.title)

      // Assign the tasks to be []
      section.tasks = []

      // Push the Column
      this.sections.push(section)
    }

  }

  /**
   * This function creates a new column and add it to the current column array
   * @param groupId = this.groupId
   * @param columnName
   * Makes a HTTP Post request
   */
  createNewSection(groupId: string, columnName: string) {

    // Column Service Instance
    let columnService = this.injector.get(ColumnService)

    // Utility Service Instance
    let utilityService = this.injector.get(UtilityService)

    // Call the HTTP Service function
    utilityService.asyncNotification('Please wait we are creating a new column...', new Promise((resolve, reject) => {
      columnService.addColumn(groupId, columnName)
        .then((res) => {
          resolve(utilityService.resolveAsyncPromise('New Column Created!'));
        })
        .catch((err) => {
          reject(utilityService.rejectAsyncPromise('Unable to create the column at the moment, please try again!'))
        })
    }))
  }

  /**
   * This function is responsible for updating the task in the UI when it changes the section
   * @param { data.post, data.oldSection} - data
   */
  onTaskChangeSection(data) {
    const post = data.post;
    if (post) {
      const oldSectionIndex = this.sections.findIndex((section) => section.title.toLowerCase() === data.oldSection.toLowerCase());
      const sectionIndex = this.sections.findIndex((section) => section.title.toLowerCase() === post.task._column.title.toLowerCase());
      if (sectionIndex !== -1) {
        let indexTask = this.sections[oldSectionIndex].tasks.findIndex((task: any) => task._id === post._id);
        if (oldSectionIndex !== -1) {
          if (indexTask !== -1) {
            this.sections[oldSectionIndex].tasks.splice(indexTask, 1);
          } else {
            indexTask = this.sections[oldSectionIndex].tasks.done.findIndex((task: any) => task._id === post._id);
            if (indexTask !== -1) {
              this.sections[oldSectionIndex].tasks.done.splice(indexTask, 1);
            }
          }
        }

        if (post.task.status === 'done') {
          indexTask = this.sections[sectionIndex].tasks.done.findIndex((task: any) => task._id === post._id);
          if (indexTask < 0) {
            this.sections[sectionIndex].tasks.done.unshift(post);
            this.sections[sectionIndex].tasks.done = [...this.sections[sectionIndex].tasks.done];
          }
        } else {
          indexTask = this.sections[sectionIndex].tasks.findIndex((task: any) => task._id === post._id);
          if (indexTask < 0) {
            this.sections[sectionIndex].tasks.unshift(post);
            const doneTasks = this.sections[sectionIndex].tasks.done;
            this.sections[sectionIndex].tasks = [...this.sections[sectionIndex].tasks];
            this.sections[sectionIndex].tasks.done = doneTasks;
          }
        }
      }
      this.initSections()
    }
  }
}
