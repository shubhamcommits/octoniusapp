import { Component, OnChanges, Input, Injector, ViewChild, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { ColumnService } from 'src/shared/services/column-service/column.service';
import moment from 'moment/moment';

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
  @Input() sortingData: any;
  @Input() isAdmin = false;
  @Input() isIdeaModuleAvailable = false;
  @Input() isShuttleTasksModuleAvailable = false;

  @Output() taskClonnedEvent = new EventEmitter();
  @Output() newSectionEvent = new EventEmitter();

  @ViewChild(MatAccordion, { static: true }) accordion: MatAccordion;

  // customFieldsToShow: any[] = [];

  // Today's date object
  today = moment().local().startOf('day').format('YYYY-MM-DD');

  // Fetch groupId from router snapshot
  groupId = this.router.snapshot.queryParamMap.get('group');

  // Base URL of the uploads
  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  // Property to know the selected field to add as column
  field: string;

  newColumnSelected;

  displayedColumns = ['title', 'tags', 'asignee', 'due_to', 'nsPercent', 'star'];

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    private columnService: ColumnService,
    private injector: Injector,
    private router: ActivatedRoute,
    public dialog: MatDialog
  ) { }

  async ngOnChanges(changes: SimpleChanges) {
    for (const propName in changes) {
      const change = changes[propName];
      const to = change.currentValue;
      if (propName === 'sortingBit') {
        this.sortingBit = to;
      }
      if (propName === 'sortingData') {
        this.sortingData = to;
      }
    }
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
      this.utilityService.warningNotification($localize`:@@taskTable.sectionWithSameNameAlreadyExists:Section with the same title already exist, please try with different name!`)
    }

    // If not found, then push the element
    else {

      // Create the Column asynchronously
      this.createNewSection(this.groupId, section.title);
    }

  }

  /**
   * This function creates a new column and add it to the current column array
   * @param groupId = this.groupId
   * @param columnName
   * Makes a HTTP Post request
   */
  createNewSection(groupId: string, columnName: string) {

    // Call the HTTP Service function
    this.utilityService.asyncNotification($localize`:@@taskTable.pleaseWaitWeCreateSection:Please wait we are creating a new section...`, new Promise((resolve, reject) => {
      this.columnService.addColumn(groupId, columnName)
        .then((res) => {
          let section = res['column'];

          // Assign the tasks to be []
          section.tasks = [];
          section.custom_fields_to_show = ['priority'];

          this.newSectionEvent.emit(section);

          resolve(this.utilityService.resolveAsyncPromise($localize`:@@taskTable.newSectionCreated:New Section Created!`));
        })
        .catch((err) => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@taskTable.unableToCreateSection:Unable to create the section at the moment, please try again!`))
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

      //this.initSections()
    }
  }

  onTaskClonned(data) {
    this.taskClonnedEvent.emit(data);
  }

  async removeRagTag(column, event) {
    await this.utilityService.asyncNotification($localize`:@@groupKanbanBoards.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
      this.columnService.removeRag(column._id, event)
        .then((res) => {
          // Find the index of the column to check if the same named column exist or not
          let index = (column.rags) ? column.rags.findIndex((ragTag: any) => ragTag == event) : -1;
          // Remove the column from the array
          if (index >= 0) {
            column.rags.splice(index, 1);
          }
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupKanbanBoards.detailsUpdated:Details updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@groupKanbanBoards.unableToUpdateDetails:Unable to update the details, please try again!`));
        });
    }));
  }
}
