import { Component, OnChanges, Input, Injector, ViewChild, Output, EventEmitter, SimpleChanges, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { ColumnService } from 'src/shared/services/column-service/column.service';

@Component({
  selector: 'app-table-view',
  templateUrl: './table-view.component.html',
  styleUrls: ['./table-view.component.scss']
})
export class TableViewComponent implements OnInit {

  @Input() groupData: any;
  @Input() userData: any;
  @Input() sections: any;
  @Input() customFields: any;
  @Input() isAdmin = false;
  @Input() sortingBit: any;
  @Input() sortingData: any;
  @Input() filteringBit: any;
  @Input() filteringData: any;
  @Input() isIdeaModuleAvailable = false;
  @Input() isShuttleTasksModuleAvailable = false;

  @ViewChild(MatAccordion, { static: true }) accordion: MatAccordion;

  canEdit: boolean = true;

  isIndividualSubscription = true;

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    private columnService: ColumnService,
    private injector: Injector,
    public dialog: MatDialog
  ) { }

  async ngOnInit() {
    this.sections.forEach(section => {
      if (section.canEdit) {
        this.canEdit = true;
      }
    });

    this.isIndividualSubscription = await this.publicFunctions.checkIsIndividualSubscription();
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
      this.createNewSection(this.groupData?._id, section.title, this.sections.length);
    }

  }

  /**
   * This function creates a new column and add it to the current column array
   * @param groupId = this.groupId
   * @param columnName
   * Makes a HTTP Post request
   */
  createNewSection(groupId: string, columnName: string, kanbanOrder: number) {

    // Call the HTTP Service function
    this.utilityService.asyncNotification($localize`:@@taskTable.pleaseWaitWeCreateSection:Please wait we are creating a new section...`, new Promise((resolve, reject) => {
      this.columnService.addSection(groupId, columnName, kanbanOrder)
        .then(async (res) => {
          let section = res['column'];

          // Assign the tasks to be []
          section.tasks = [];
          section.custom_fields_to_show = ['priority'];

          const canEdit = await this.utilityService.canUserDoTaskAction(section, this.groupData, this.userData, 'edit');
          let canView = false;

          if (!canEdit) {
            const hide = await this.utilityService.canUserDoTaskAction(section, this.groupData, this.userData, 'hide');
            canView = await this.utilityService.canUserDoTaskAction(section, this.groupData, this.userData, 'view') || !hide;
          }

          section.canEdit = canEdit;
          if (canEdit || canView) {
            // Push the Column
            this.sections.push(section);
          }

          resolve(this.utilityService.resolveAsyncPromise($localize`:@@taskTable.newSectionCreated:New Section Created!`));
        })
        .catch((err) => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@taskTable.unableToCreateSection:Unable to create the section at the moment, please try again!`))
        })
    }))
  }
}
