import { Component, OnInit, Injector, Input, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'modules/public.functions';
import { ColumnService } from 'src/shared/services/column-service/column.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-kanban-board',
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.scss']
})
export class KanbanBoardComponent implements OnInit, AfterViewInit {

  @Input() groupData: any;
  @Input() userData: any;
  @Input() sections: any;
  @Input() sortingBit: String;
  @Input() sortingData: any;
  @Input() filteringBit: String;
  @Input() filteringData: any;
  @Input() isIdeaModuleAvailable = false;
  @Input() isShuttleTasksModuleAvailable = false;

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  isMobile = false;

  canEdit: boolean = true;

  isIndividualSubscription = true;

  constructor(
    public utilityService: UtilityService,
    private columnService: ColumnService,
    private injector: Injector,
    public dialog: MatDialog
  ) { }

  async ngOnInit() {
    if (!this.utilityService.objectExists(this.groupData)) {
      this.groupData = await this.publicFunctions.getCurrentGroupDetails();
    }

    this.sections.forEach(section => {
      if (section.canEdit) {
        this.canEdit = true;
      }
    });

    this.isIndividualSubscription = await this.publicFunctions.checkIsIndividualSubscription();
  }

  ngAfterViewInit() {
    this.publicFunctions.isMobileDevice().then(res => this.isMobile = res);
  }

  /**
   * Standard Angular CDK Event which monitors the drop functionality of tasks
   * @param event
   */
  drop(event: CdkDragDrop<string[]>) {
    const oldColumn = this.sections[this.sections.findIndex(col => col._id == event.previousContainer.id)];
    const newColumn = this.sections[this.sections.findIndex(col => col._id == event.container.id)];
    if (oldColumn && newColumn && oldColumn.canEdit && newColumn.canEdit) {
      if (event.previousContainer === event.container) {

        // Move items in array
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

      } else {
        var post: any = event.previousContainer.data[event.previousIndex];

        const shuttleIndex = (post && post.task && post.task.shuttles) ? post.task.shuttles.findIndex(shuttle => (shuttle._shuttle_group._id || shuttle._shuttle_group) == this.groupData?._id) : -1;
        // Update the task column when changed with dropping events to reflect back in the task view modal
        if (post?.task?.shuttle_type && (shuttleIndex >= 0)) {
          post.task.shuttles[shuttleIndex]._shuttle_section = event.container.id;
        } else {
          post.task._column = event.container.id;
        }

        // Call move task to a new column
        this.moveTaskToNewColumn(post, event.previousContainer.id, event.container.id, shuttleIndex);
      }
    }
  }

  /**
   * Standard Angular CDK Event which monitors the drop functionality of different columns
   * @param event
   */
  dropSection(event: CdkDragDrop<string[]>) {
    // Utility Service Instance
    let utilityService = this.injector.get(UtilityService)

    // Call the HTTP Service function
    utilityService.asyncNotification($localize`:@@groupKanbanBoards.pleaseWaitWeSaveCSectionOrder:Please wait we are save the section order...`, new Promise((resolve, reject) => {
      // Move items in array
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

      const columnsMap = event.container.data.map((col, index) => { return { _id: col['_id'], position: index }});
      this.columnService.updateColumnsPosition(columnsMap)
        .then((res) => {
          resolve(utilityService.resolveAsyncPromise($localize`:@@groupKanbanBoards.orderSaved:Order saved!`));
        })
        .catch((err) => {
          reject(utilityService.rejectAsyncPromise($localize`:@@groupKanbanBoards.unableToSaveOrderOfSections:Unable to save the order of the sections at the moment, please try again!`));
        });
    }));
  }

  /**
   * This function recieves the output from the other component for creating column
   * @param section
   */
  async addColumn(section: any) {

    // Find the index of the column to check if the same named column exist or not
    let index = (this.sections) ? this.sections.findIndex((col: any) => (col._id || col) == section._id) : -1;

    // If index is found, then throw error notification
    if (index != -1) {
      this.utilityService.warningNotification($localize`:@@groupKanbanBoards.sectionWithSameNameExist:Section with the same title already exist, please try with different name!`)
    }

    // If not found, then push the element
    else {
      // Create the section asynchronously
      await this.createNewSection(this.groupData?._id, section.title, this.sections.length);
    }

  }

  /**
   * This function creates a new column and add it to the current column array
   * @param groupId = this.groupId
   * @param columnName
   * Makes a HTTP Post request
   */
  createNewSection(groupId: string, columnName: string, kanbanOrder: number) {
    // Column Service Instance
    let columnService = this.injector.get(ColumnService)

    // Utility Service Instance
    let utilityService = this.injector.get(UtilityService)

    // Call the HTTP Service function
    utilityService.asyncNotification($localize`:@@groupKanbanBoards.pleaseWaitWeCreateSection:Please wait we are creating a new section...`, new Promise((resolve, reject) => {
      columnService.addSection(groupId, columnName, kanbanOrder)
        .then(async (res) => {
          let column = res['column'];

          // Assign the tasks to be []
          column.tasks = [];

          const canEdit = await this.utilityService.canUserDoTaskAction(column, this.groupData, this.userData, 'edit');
          let canView = false;

          if (!canEdit) {
            const hide = await this.utilityService.canUserDoTaskAction(column, this.groupData, this.userData, 'hide');
            canView = await this.utilityService.canUserDoTaskAction(column, this.groupData, this.userData, 'view') || !hide;
          }

          column.canEdit = canEdit;
          if (canEdit || canView) {
            // Push the Column
            this.sections.push(column);
          }

          resolve(utilityService.resolveAsyncPromise($localize`:@@groupKanbanBoards.newSectionCreated:New Section Created!`));
        })
        .catch((err) => {
          reject(utilityService.rejectAsyncPromise($localize`:@@groupKanbanBoards.unableToCreateSection:Unable to create the section at the moment, please try again!`))
        });
    }));
  }

  /**
   * This function is responsible for renaming a column
   * @param oldCol
   * @param newColTitle
   */
  onEditSection(data: any) {
    const oldSection = data.oldSection;
    const newSectionTitle = data.newSectionTitle;

    // Find the index of the column to check if the same named column exist or not
    let index = (this.sections) ? this.sections.findIndex((col: any) => col.title.toLowerCase() === newSectionTitle.toLowerCase()) : -1 ;

    // If index is found, then throw error notification
    if (index != -1) {
      this.utilityService.warningNotification($localize`:@@groupKanbanBoards.sectionWithSameTitleExists:Section with the same title already exists, please try with different name!`)
    }

    // If not found, then change the element details
    else if (index === -1) {
      const columnId = oldSection._id;
      oldSection.title = newSectionTitle
      // Column Service Instance
      let columnService = this.injector.get(ColumnService)

      // Call the HTTP Service function
      this.utilityService.asyncNotification($localize`:@@groupKanbanBoards.pleaseWaitWeRenameSection:Please wait we are renaming your section`, new Promise((resolve, reject) => {
        columnService.editColumnName(columnId, newSectionTitle)
          .then((res) => {
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupKanbanBoards.sectionRenamed:Section Renamed!`));
          })
          .catch((err) => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@groupKanbanBoards.unableToRenameSection:Unable to rename the section at the moment, please try again!`))
          })
      }))
    }
  }

  /**
   * This function is responsible for deleting a column from the board
   * @param column
   */
  onDeleteSection(column: any) {
    // Open the Confirm Dialog to ask for permission
    this.utilityService.getConfirmDialogAlert($localize`:@@groupKanbanBoards.areYouSure:Are you sure?`, $localize`:@@groupKanbanBoards.byDoingThisTasksWillBeDeleted:By doing this all the tasks from this section will be deleted!`)
      .then((res) => {
        if (res.value) {

          // Call the HTTP Service function
          this.utilityService.asyncNotification($localize`:@@groupKanbanBoards.pleaseWaitWeRemovingSection:Please wait we are removing your section...`, new Promise((resolve, reject) => {
            this.columnService.deleteColumn(column?._id)
              .then((res) => {
                // Find the index of the column to check if the same named column exist or not
                let index = (this.sections) ? this.sections.findIndex((col: any) => col._id === column._id) : -1;
                // Remove the column from the array
                this.sections.splice(index, 1);

                resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupKanbanBoards.sectionRemoved:Section Removed!`));
              })
              .catch((err) => {
                reject(this.utilityService.rejectAsyncPromise($localize`:@@groupKanbanBoards.unableToRemoveSection:Unable to remove the section at the moment, please try again!`))
              })
          }));
        }
      })
  }

  /**
   * This function is responsible for removing the task from the UI
   * @param column - column data
   * @param post - post
   */
  removeTask(column: any, post: any) {

    // Find the index of the tasks inside the column
    let index = (column && column.tasks) ? column.tasks.findIndex((task: any) => task._id == post._id) : -1;

    // If the index is not found
    if (index != -1) {

      // Remove the tasks from the array
      column.tasks.splice(index, 1)
    }
  }

  /**
   * This function is responsible for deleting a section from the board
   * @param section
   */
  onArchiveSection(section: any) {
    // Open the Confirm Dialog to ask for permission
    this.utilityService.getConfirmDialogAlert($localize`:@@groupKanbanBoards.areYouSure:Are you sure?`, $localize`:@@groupKanbanBoards.byDoingThisTasksWillBeArchived:By doing this all the tasks from this section will be archived!`)
      .then((res) => {
        if (res.value) {
          // Find the index of the column to check if the same named column exist or not
          let index = (this.sections) ? this.sections.findIndex((col: any) => col._id === section._id) : -1;

          // Call the HTTP Service function
          this.utilityService.asyncNotification($localize`:@@groupKanbanBoards.pleaseWaitWeArchivingSection:Please wait we are archiving your section...`, new Promise((resolve, reject) => {
            this.columnService.archiveColumn(section._id)
              .then((res) => {
                // Remove the tasks from the section
                // this.sections[index].tasks = [];
                this.sections.splice(index, 1);

                resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupKanbanBoards.sectionArchived:Section Archived!`));
              })
              .catch((err) => {
                reject(this.utilityService.rejectAsyncPromise($localize`:@@groupKanbanBoards.unableToArchiveSection:Unable to archived the section at the moment, please try again!`))
              })
          }))
        }
      })
  }

  /**
   * This function is responsible for fetching the post
   * @param post
   * @param column
   */
  getPost(post: any, column: any) {
    post.canEdit = true;
    // Adding the post to column
    column.tasks.unshift(post)
  }

  /**
   * This function handles the response of moving the task to another column
   * @param task
   * @param columnId
   */
  async moveTaskToNewColumn(task: any, oldColumnId: string, columnId: string, shuttleIndex: number) {

    if (task?.task?.shuttle_type && shuttleIndex >= 0) {
      await this.publicFunctions.changeTaskShuttleSection(task?._id, this.groupData?._id, columnId);
    } else {
      await this.publicFunctions.changeTaskColumn(task._id, columnId, this.userData._id, this.groupData?._id);
    }

    task = await this.publicFunctions.executedAutomationFlowsPropertiesFront(null, task, this.groupData?._id, false, shuttleIndex);

    // Prepare Event
    let columnEvent = {
      post: task,
      newColumn: columnId,
      oldColumn: oldColumnId
    }

    this.moveTaskToColumnFront(columnEvent)
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return !(JSON.stringify(object) === JSON.stringify({}))
  }

  onDeleteEvent(id) {
    this.sections.forEach((col, indexColumn) => {
      // Find the index of the tasks inside the column
      const indexTask = (col && col.tasks) ? col.tasks.findIndex((task: any) => task._id === id) : -1;
      if (indexTask !== -1) {
        this.sections[indexColumn].tasks.splice(indexTask, 1);
        return;
      }
    });
  }

  /**
   * This function handles the UI updation of the moving tasks into various columns
   * @param $event
   */
  moveTaskToColumnFront(columnEvent: any) {

    // Find the oldColumnIndex in which task existed
    let oldColumnIndex = (this.sections) ? this.sections.findIndex((column: any) => column._id == columnEvent.oldColumn) : -1;

    // Find the newColumnIndex in which task is to be shifted
    let newColumnIndex = (this.sections) ? this.sections.findIndex((column: any) => column._id == columnEvent.newColumn) : -1;

    let index = (this.sections && oldColumnIndex >= 0 && this.sections[oldColumnIndex] && this.sections[oldColumnIndex]['tasks'])
      ? this.sections[oldColumnIndex]['tasks'].findIndex((post: any) => post._id === columnEvent.post._id)
      : -1;

    // Remove the task from the old Column
    this.sections[oldColumnIndex]['tasks'].splice(index, 1);

    // Find the highest due date on the tasks of the column
    // if (this.sections[oldColumnIndex]['tasks'].length == 0) {
    //   this.sections[oldColumnIndex].real_due_date = null;
    // } else {
    //   this.sections[oldColumnIndex].real_due_date = this.publicFunctions.getHighestDate(this.sections[oldColumnIndex].tasks);
    // }

    // Add the task into the new column
    this.sections[newColumnIndex]['tasks'].unshift(columnEvent.post);
    // Find the highest due date on the tasks of the column
    // if (this.sections[newColumnIndex]['tasks'].length == 0) {
    //   this.sections[newColumnIndex].real_due_date = null;
    // } else {
    //   this.sections[newColumnIndex].real_due_date = this.publicFunctions.getHighestDate(this.sections[newColumnIndex].tasks);
    // }

    // Calculate number of done tasks
    this.sections[oldColumnIndex].numDoneTasks = this.sections[oldColumnIndex].tasks.filter((post) => post?.task?.status?.toLowerCase() == 'done').length;
    this.sections[newColumnIndex].numDoneTasks = this.sections[newColumnIndex].tasks.filter((post) => post?.task?.status?.toLowerCase() == 'done').length;
  }

  // onTaskClonned(data) {
  //   this.taskClonnedEvent.emit(data);
  // }

  isGroupManager() {
    return (this.groupData && this.groupData._admins) ? (this.groupData?._admins.findIndex((admin: any) => (admin._id || admin) == this.userData?._id) >= 0) : false;
  }
}
