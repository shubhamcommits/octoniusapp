import { Component, OnInit, Injector } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { SubSink } from 'subsink';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import { ActivatedRoute } from '@angular/router';
import { ColumnService } from 'src/shared/services/column-service/column.service';

@Component({
  selector: 'app-group-kanban-boards',
  templateUrl: './group-kanban-boards.component.html',
  styleUrls: ['./group-kanban-boards.component.scss']
})
export class GroupKanbanBoardsComponent implements OnInit {

  constructor(
    private router: ActivatedRoute,
    public utilityService: UtilityService,
    private injector: Injector,
  ) { }

  columns: any = []

  // Fetch groupId from router snapshot
  groupId = this.router.snapshot['_urlSegment']['segments'][2]['path'];


  // Current Group Data
  groupData: any;

  // Current User Data
  userData: any;

  // Subsink Object
  subSink = new SubSink();

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  async ngOnInit() {

    // Fetch current group from the service
    this.subSink.add(this.utilityService.currentGroupData.subscribe(async (res) => {
      if (JSON.stringify(res) != JSON.stringify({})) {

        // Assign the GroupData
        this.groupData = res;
      }
    }))

    // Fetch current user details
    this.userData = await this.publicFunctions.getCurrentUser();

    /**
     * Here we fetch all the columns available in a group, and if null we initialise them with the default one
     */
    this.columns = await this.publicFunctions.getAllColumns(this.groupId);
    if (this.columns == null) {
      this.columns = await this.initialiseColumns(this.groupId);
    }

    /**
     * Adding the property of tasks in every column
     */
    this.columns.forEach((column: any) => {
      column.tasks = []
    });

    console.log(this.columns)

  }

  /**
   * This function initialises the default column - todo
   * @param groupId 
   */
  async initialiseColumns(groupId: string) {

    // Column Service Instance
    let columnService = this.injector.get(ColumnService)

    // Call the HTTP Put request
    return new Promise((resolve, reject) => {
      columnService.initColumns(groupId)
        .then((res) => {
          resolve(res['columns']);
        })
        .catch((err) => {
          this.utilityService.errorNotification('Unable to initialise the columns, please try again later!');
          reject({});
        })
    })
  }


  /**
   * This function recieves the output from the other component for creating column
   * @param column 
   */
  addColumn(column: any) {

    // Find the index of the column to check if the same named column exist or not
    let index = this.columns.findIndex((col: any) => col.title.toLowerCase() === column.title.toLowerCase())

    // If index is found, then throw error notification
    if (index != -1) {
      this.utilityService.warningNotification('Column with the same title aready exist, please try with different name!')
    }

    // If not found, then push the element
    else {

      // Create the Column asynchronously
      this.createNewColumn(this.groupId, column.title)

      // Push the Column 
      column.tasks = []
      this.columns.push(column)

      console.log(this.columns)
    }

  }

  /**
   * This function creates a new column and add it to the current column array
   * @param groupId = this.groupId
   * @param columnName
   * Makes a HTTP Post request
   */
  createNewColumn(groupId: string, columnName: string) {

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
   * This function is responsible for renaming a column
   * @param oldCol 
   * @param newColTitle 
   */
  editColumn(oldCol: any, newColTitle: any) {

    // Find the index of the column to check if the same named column exist or not
    let index = this.columns.findIndex((col: any) => col.title.toLowerCase() === newColTitle.toLowerCase())

    // If index is found, then throw error notification
    if (index != -1) {
      this.utilityService.warningNotification('Column with the same title aready exist, please try with different name!')
    }

    // If not found, then change the element details
    else if (index === -1) {
      oldCol.title = newColTitle
    }
  }

  /**
   * This function is responsible for deleting a column from the board
   * @param column 
   */
  deleteColumn(column: any) {

    // Open the Confirm Dialog to ask for permission
    this.utilityService.getConfirmDialogAlert('Are you sure?', 'By doing this all the tasks from this column will be transfered to the default column!')
      .then((res) => {
        if (res.value) {
          // Find the index of the column to check if the same named column exist or not
          let index = this.columns.findIndex((col: any) => col.title.toLowerCase() === column.title.toLowerCase())

          // If index is found, then throw error notification
          if (index === -1) {
            this.utilityService.warningNotification('Unable to delete the column, please try again!')
          }

          // If not found, then remove the element
          else if (index != -1) {
            this.columns.splice(index, 1)
          }
        }
      })
  }

  getPost(post: any, column: any) {
    console.log(post, column)
    column.tasks.push(post)
  }

  /**
   * Unsubscribe all the observables to avoid memory leaks
   */
  ngOnDestroy() {
    this.subSink.unsubscribe()
  }

}
