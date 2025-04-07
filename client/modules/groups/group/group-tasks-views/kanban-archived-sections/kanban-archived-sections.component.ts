import {
  Component,
  OnInit,
  Injector,
  Input,
  OnChanges,
  AfterViewInit,
  SimpleChanges,
  Output,
  EventEmitter,
  OnDestroy,
} from "@angular/core";
import { UtilityService } from "src/shared/services/utility-service/utility.service";
import { PublicFunctions } from "modules/public.functions";
import { ColumnService } from "src/shared/services/column-service/column.service";
import { DateTime } from "luxon";
import { MatDialog } from "@angular/material/dialog";
import { FlowService } from "src/shared/services/flow-service/flow.service";
import { BehaviorSubject } from "rxjs";
import { DatesService } from "src/shared/services/dates-service/dates.service";

@Component({
  selector: "app-kanban-archived-sections",
  templateUrl: "./kanban-archived-sections.component.html",
  styleUrls: ["./kanban-archived-sections.component.scss"],
})
export class KanbanArchivedSectionsComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy
{
  @Input() groupData: any;
  @Input() userData: any;
  @Input() customFields: any;
  @Input() sortingBit: String;
  @Input() sortingData: any;
  @Input() isIdeaModuleAvailable = false;
  @Input() isShuttleTasksModuleAvailable = false;

  @Output() taskClonnedEvent = new EventEmitter();
  @Output() newSectionEvent = new EventEmitter();
  @Output() moveSectionEvent = new EventEmitter();

  columns: any = [];
  // Task Posts array variable
  tasks: any = [];

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  // Today's date object
  today = DateTime.now();

  flows = [];

  canSeeBudget = false;

  tasktest: any;

  unchangedColumns: any;

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  constructor(
    private flowService: FlowService,
    private injector: Injector,
    public utilityService: UtilityService,
    public datesService: DatesService,
    public dialog: MatDialog
  ) {}

  async ngOnInit() {
    // Start the loading spinner
    this.isLoading$.next(true);

    await this.initView();

    // Return the function via stopping the loader
    return this.isLoading$.next(false);
  }

  async ngOnChanges(changes: SimpleChanges) {}

  ngAfterViewInit() {}

  ngOnDestroy() {
    this.isLoading$.complete();
  }

  async initView() {
    this.flowService
      .getGroupAutomationFlows(this.groupData?._id)
      .then((res) => {
        this.flows = res["flows"];
      });

    this.canSeeBudget =
      this.userData?.role == "owner" ||
      this.userData?.role == "admin" ||
      this.userData?.role == "manager" ||
      this.isGroupManager();

    /**
     * Here we fetch all the columns available in a group, and if null we initialise them with the default one
     */
    this.columns = await this.publicFunctions.getAllArchivedColumns(
      this.groupData?._id
    );

    /**
     * Adding the property of tasks in every column
     */
    if (this.columns) {
      this.columns?.forEach((column: any) => {
        column.tasks = [];
      });
    }

    // Fetch all the tasks posts from the server
    this.tasks = await this.publicFunctions.getArchivedTasks(
      this.groupData?._id
    );

    if (this.groupData.shuttle_type && this.isShuttleTasksModuleAvailable) {
      const shuttleTasks = await this.publicFunctions.getShuttleTasks(
        this.groupData?._id
      );
      this.tasks = this.tasks.concat(shuttleTasks);
    }

    /**
     * Sort the tasks into their respective columns
     */
    await this.sortTasksInColumns(this.columns, this.tasks);

    let col = [];
    if (this.columns) {
      this.columns.forEach((val) => col.push(Object.assign({}, val)));
    }
    let unchangedColumns: any = { columns: col };
    this.unchangedColumns = JSON.parse(JSON.stringify(unchangedColumns));
  }

  /**
   * This Function is responsible for sorting the tasks into columns
   * @param columns
   * @param tasks
   */
  sortTasksInColumns(columns: any, tasks: any) {
    if (columns) {
      columns.forEach(async (column: any) => {
        // Feed the tasks into that column which has matching property _column with the column title
        column.tasks = await tasks
          .filter(
            (post: any) =>
              (post.task._column &&
                (post.task._column._id || post.task._column) == column._id) ||
              (post.task.shuttle_type &&
                post.task.shuttles &&
                post.task.shuttles.findIndex(
                  (shuttle) =>
                    (shuttle._shuttle_section._id ||
                      shuttle._shuttle_section) == column._id
                ) >= 0)
          )
          .sort(function (t1, t2) {
            if (t1.task.status != t2.task.status) {
              return t1.task.status == "done" ? 1 : -1;
            }
            return t2.title - t1.title;
          });

        // Find the hightes due date on the tasks of the column
        // const highestDate = this.publicFunctions.getHighestDate(column.tasks);
        // column.real_due_date = (highestDate) ? highestDate : column?.due_date;

        // Calculate number of done tasks
        column.numDoneTasks = column.tasks.filter(
          (post) => post?.task?.status?.toLowerCase() == "done"
        ).length;
      });
    }
  }

  formateDate(date: any, format: string) {
    return this.datesService.formateDate(date, format);
  }

  /**
   * This function is responsible for removing the column
   * @param groupId
   */
  removeColumn(columnId: string) {
    // Column Service Instance
    let columnService = this.injector.get(ColumnService);

    // Utility Service Instance
    let utilityService = this.injector.get(UtilityService);

    // Call the HTTP Service function
    utilityService.asyncNotification(
      $localize`:@@groupKanbanArchivedBoards.pleaseWaitWeRemovingSection:Please wait we are removing your section...`,
      new Promise((resolve, reject) => {
        columnService
          .deleteColumn(columnId)
          .then((res) => {
            resolve(
              utilityService.resolveAsyncPromise(
                $localize`:@@groupKanbanArchivedBoards.sectionRemoved:Section Removed!`
              )
            );
          })
          .catch((err) => {
            reject(
              utilityService.rejectAsyncPromise(
                $localize`:@@groupKanbanArchivedBoards.unableToRemoveSection:Unable to remove the section at the moment, please try again!`
              )
            );
          });
      })
    );
  }

  /**
   * This function is responsible for renaming a column
   * @param oldCol
   * @param newColTitle
   */
  editColumn(oldCol: any, newColTitle: any) {
    // Find the index of the column to check if the same named column exist or not
    let index = this.columns.findIndex(
      (col: any) => col.title.toLowerCase() === newColTitle.toLowerCase()
    );

    // If index is found, then throw error notification
    if (index != -1) {
      this.utilityService.warningNotification(
        $localize`:@@groupKanbanArchivedBoards.sectionWithSameTitleExists:Section with the same title already exists, please try with different name!`
      );
    }

    // If not found, then change the element details
    else if (index === -1) {
      const columnId = oldCol._id;
      oldCol.title = newColTitle;
      // Column Service Instance
      let columnService = this.injector.get(ColumnService);

      // Call the HTTP Service function
      this.utilityService.asyncNotification(
        $localize`:@@groupKanbanArchivedBoards.pleaseWaitWeRenameSection:Please wait we are renaming your section`,
        new Promise((resolve, reject) => {
          columnService
            .editColumnName(columnId, newColTitle)
            .then((res) => {
              resolve(
                this.utilityService.resolveAsyncPromise(
                  $localize`:@@groupKanbanArchivedBoards.sectionRenamed:Section Renamed!`
                )
              );
            })
            .catch((err) => {
              reject(
                this.utilityService.rejectAsyncPromise(
                  $localize`:@@groupKanbanArchivedBoards.unableToRenameSection:Unable to rename the section at the moment, please try again!`
                )
              );
            });
        })
      );
    }
  }

  /**
   * This function is responsible for deleting a column from the board
   * @param column
   */
  deleteColumn(column: any) {
    // Open the Confirm Dialog to ask for permission
    this.utilityService
      .getConfirmDialogAlert(
        $localize`:@@groupKanbanArchivedBoards.areYouSure:Are you sure?`,
        $localize`:@@groupKanbanArchivedBoards.byDoingThisTasksWillBeDeleted:By doing this all the tasks from this section will be deleted!`
      )
      .then((res) => {
        if (res.value) {
          // Find the index of the column to check if the same named column exist or not
          let index = this.columns.findIndex(
            (col: any) => col._id === column._id
          );
          // Remove the column from the array
          this.columns.splice(index, 1);

          // This function removes the column
          this.removeColumn(column._id);
        }
      });
  }

  /**
   * This function is responsible for deleting a column from the board
   * @param column
   */
  unarchiveColumn(column: any) {
    // Open the Confirm Dialog to ask for permission
    this.utilityService
      .getConfirmDialogAlert(
        $localize`:@@groupKanbanArchivedBoards.areYouSure:Are you sure?`,
        $localize`:@@groupKanbanArchivedBoards.byDoingThisTasksWillBeUnarchived:By doing this all the tasks from this section will be unarchive!`
      )
      .then((res) => {
        if (res.value) {
          // Find the index of the column to check if the same named column exist or not
          let index = this.columns.findIndex(
            (col: any) => col._id === column._id
          );

          // Column Service Instance
          let columnService = this.injector.get(ColumnService);

          // Utility Service Instance
          let utilityService = this.injector.get(UtilityService);

          // Call the HTTP Service function
          utilityService.asyncNotification(
            $localize`:@@groupKanbanArchivedBoards.pleaseWaitWeUnarchivingSection:Please wait we are unarchiving your section...`,
            new Promise((resolve, reject) => {
              columnService
                .archiveColumn(column._id)
                .then((res) => {
                  // Remove the column from the array
                  this.columns.splice(index, 1);

                  resolve(
                    utilityService.resolveAsyncPromise(
                      $localize`:@@groupKanbanArchivedBoards.sectionUnarchived:Section Unarchived!`
                    )
                  );
                })
                .catch((err) => {
                  reject(
                    utilityService.rejectAsyncPromise(
                      $localize`:@@groupKanbanArchivedBoards.unableToUnarchiveSection:Unable to unarchived the section at the moment, please try again!`
                    )
                  );
                });
            })
          );
        }
      });
  }

  /**
   * This function is responsible for removing the task from the UI
   * @param column - column data
   * @param post - post
   */
  removeTask(column: any, post: any) {
    // Find the index of the tasks inside the column
    let index = column.tasks.findIndex((task: any) => task._id == post._id);

    // If the index is not found
    if (index != -1) {
      // Remove the tasks from the array
      column.tasks.splice(index, 1);
    }
  }

  /**
   * This function is responsible for fetching the post
   * @param post
   * @param column
   */
  getPost(post: any, column: any) {
    // Adding the post to column
    column.tasks.unshift(post);
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return !(JSON.stringify(object) === JSON.stringify({}));
  }

  async onModalCloseEvent(data) {
    this.updateTask(data);
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
   * This function is responsible for opening a fullscreen dialog to edit a task
   */
  openFullscreenModal(postData: any): void {
    const canOpen =
      !this.groupData?.enabled_rights || postData?.canView || postData?.canEdit;
    const dialogRef = this.utilityService.openPostDetailsFullscreenModal(
      postData,
      this.groupData._id,
      canOpen,
      this.columns
    );
    if (dialogRef) {
      const deleteEventSubs = dialogRef.componentInstance.deleteEvent.subscribe(
        (data) => {
          this.onDeleteEvent(data);
        }
      );
      const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe(
        (data) => {
          this.updateTask(data);
        }
      );
      const parentAssignEventSubs =
        dialogRef.componentInstance.parentAssignEvent.subscribe((data) => {
          this.onDeleteEvent(data._id);
        });
      const taskClonnedEventSubs =
        dialogRef.componentInstance.taskClonnedEvent.subscribe((data) => {
          this.onTaskClonned(data);
        });
      const taskRecurrentEventSubs =
        dialogRef.componentInstance.taskRecurrentEvent.subscribe((data) => {
          this.onTaskClonned(data);
        });

      dialogRef.afterClosed().subscribe((result) => {
        closeEventSubs.unsubscribe();
        deleteEventSubs.unsubscribe();
        parentAssignEventSubs.unsubscribe();
        taskClonnedEventSubs.unsubscribe();
        taskRecurrentEventSubs.unsubscribe();
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
      const indexTask = col.tasks.findIndex(
        (task: any) => task._id === post._id
      );
      if (indexTask != -1) {
        if (
          !!post.task._column &&
          col._id == (post.task._column._id || post.task._column)
        ) {
          // update the tasks from the array
          this.columns[indexColumn].tasks[indexTask] = post;
        } else {
          const shuttleIndex = !!post.task.shuttles
            ? post.task.shuttles.findIndex(
                (s) => (s._shuttle_section._id || s._shuttle_section) == col._id
              )
            : -1;
          let indexNewColumn = this.columns.findIndex(
            (column: any) =>
              (post.task._column &&
                column._id == (post.task._column._id || post.task._column)) ||
              (shuttleIndex >= 0 &&
                column._id ==
                  (post.task.shuttles[shuttleIndex]._shuttle_section._id ||
                    post.task[shuttleIndex]._shuttle_section))
          );
          if (indexNewColumn != -1) {
            this.columns[indexNewColumn].tasks.unshift(post);
            this.columns[indexColumn].tasks.splice(indexTask, 1);
          }
        }
        // Find the hightes due date on the tasks of the column
        // col.real_due_date = this.publicFunctions.getHighestDate(col.tasks);

        // Calculate number of done tasks
        col.numDoneTasks = col.tasks.filter(
          (post) => post?.task?.status?.toLowerCase() == "done"
        ).length;

        return;
      }
    });
  }

  /**
   * This function updates the status on the UI
   * @param task
   * @param status
   */
  changeStatus(task: any, status: any) {
    // Set the status
    task.task.status = status;
  }

  /**
   * This function changes the assignee
   * @param task
   * @param memberMap
   */
  changeAssignee(task: any, memberMap: any) {
    // Call the HTTP Request to change the assignee
    this.publicFunctions.changeTaskAssignee(task._id, memberMap["_id"]);

    // Set the assigned_to variable
    task._assigned_to = memberMap;
  }

  /**
   * This function changes the details on the UI
   * @param task
   * @param post
   */
  changeDetails(task: any, post: any) {
    // Update task title
    task.title = post.title;

    // Update task content
    task.content = post.content;

    // Update task tags
    task.tags = post.tags;

    // Update task files
    task.files = post.files;

    // Update the liked by
    task._liked_by = post._liked_by;

    // Update the content mentions
    task._content_mentions = post._content_mentions;

    // Update the task comments
    task.comments = post.comments;
  }

  /**
   * This function is responsible for closing the modals
   */
  closeModal() {
    this.utilityService.closeAllModals();
  }

  onTaskClonned(data) {
    this.taskClonnedEvent.emit(data);
  }

  isDelay(realDueDate: any, dueDate: any) {
    return this.datesService.isBefore(dueDate, realDueDate);
  }

  calculateCFStatistics(cfName: string, tasks: any) {
    let calculation = 0;
    tasks.forEach((task) => {
      calculation +=
        task.task.custom_fields &&
        task.task.custom_fields[cfName] &&
        !isNaN(task.task.custom_fields[cfName])
          ? +task.task.custom_fields[cfName]
          : 0;
    });
    return calculation;
  }

  isGroupManager() {
    return this.groupData && this.groupData._admins
      ? this.groupData?._admins.findIndex(
          (admin: any) => (admin._id || admin) == this.userData?._id
        ) >= 0
      : false;
  }
}
