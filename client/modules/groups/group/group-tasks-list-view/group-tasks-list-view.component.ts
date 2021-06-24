import { Component, OnChanges, Input, Injector, ViewChild, Output, EventEmitter, SimpleChanges } from '@angular/core';
import moment from 'moment/moment';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
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
  @Input() sortingBit: any;
  @Input() filteringBit:any;
  @Input() filteringData:any;
  @Input() isAdmin = false;

  @Output() taskClonnedEvent = new EventEmitter();
  @Output() newSectionEvent = new EventEmitter();

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
  ) { }

  async ngOnChanges(changes: SimpleChanges) {
    this.initSections();
    for (const propName in changes) {
      const change = changes[propName];
      const to = change.currentValue;
      const from = change.previousValue;
      if (propName === 'sortingBit') {
        this.sortingBit = to;
      }
      if (propName === 'filteringBit') {
        // this.filtering(to);
      }
      if (propName === 'filteringData') {
        this.filteringData = to;
        if(this.filteringData){
          // this.filtering(this.filteringBit);

        }
      }
    }
  }

  initSections() {
    this.sections.forEach(section => {
      let tasks = [];

      // Filtering other tasks
      section.tasks.forEach(task => {
        if (task.bars !== undefined && task.bars.length > 0) {
          task.bars.forEach(bar => {
            if (bar.tag_members.includes(this.userData._id) || this.userData.role !== "member") {
              tasks.push(task);
            }
          });
        } else {
          tasks.push(task);
        }
      });
      section.tasks = tasks;
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

    // const doneTasks = [...section.tasks['done']];
    section.tasks = [...section.tasks];
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
      this.createNewSection(this.groupId, section.title);

      this.newSectionEvent.emit(section);
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
    utilityService.asyncNotification('Please wait we are creating a new section...', new Promise((resolve, reject) => {
      columnService.addColumn(groupId, columnName)
        .then((res) => {
          let section = res['column'];

          // Assign the tasks to be []
          section.tasks = [];
          section.custom_fields_to_show = ['priority'];

          // Push the Column
          this.sections.push(section);

          resolve(utilityService.resolveAsyncPromise('New Section Created!'));
        })
        .catch((err) => {
          reject(utilityService.rejectAsyncPromise('Unable to create the section at the moment, please try again!'))
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
      const oldSectionIndex = this.sections.findIndex((section) => (section._id || section) == data.oldSectionId);
      const sectionIndex = this.sections.findIndex((section) => (section._id || section) == (post.task._column._id || post.task._column));

      if (oldSectionIndex != -1 && sectionIndex != -1) {
        const oldIndexTask = this.sections[oldSectionIndex].tasks.findIndex((task: any) => task._id == post._id);
        const indexTask = this.sections[sectionIndex].tasks.findIndex((task: any) => task._id == post._id);

        if (oldIndexTask != -1) {
          this.sections[oldSectionIndex].tasks.splice(oldIndexTask, 1);
        }

        if (indexTask == -1) {
          this.sections[sectionIndex].tasks.unshift(post);
          this.sections[sectionIndex].tasks = [...this.sections[sectionIndex].tasks];
        }
      }

      this.initSections()
    }
  }

  onTaskClonned(data) {
    this.taskClonnedEvent.emit(data);
  }
}
