import { Component, Injector, Input, OnChanges, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { PostService } from 'src/shared/services/post-service/post.service';
import { CFB } from 'xlsx/types';
import { CustomFieldsTableSettingsDialogComponent } from './custom-fields-table-settings-dialog/custom-fields-table-settings-dialog.component';

@Component({
  selector: 'app-custom-field-table-card',
  templateUrl: './custom-field-table-card.component.html',
  styleUrls: ['./custom-field-table-card.component.scss']
})
export class CustomFieldTableCardComponent implements OnChanges {

  @Input() period;
  @Input() groupData: any
  @Input() customFields: any = [];

  // Current Workspace Data
  //workspaceData: any;

  tasks = [];

  selectTypeCustomField: any;
  inputTypeCustomFields = []

  selectTypeCF: any;
  inputTypeCFs = [];

  tableData = [];

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector)

  constructor(
    private postService: PostService,
    private injector: Injector,
    public dialog: MatDialog
  ) { }

  async ngOnChanges() {
    this.selectTypeCF = this.groupData?.custom_fields_table_widget?.selectTypeCF;
    this.inputTypeCFs = this.groupData?.custom_fields_table_widget?.inputTypeCFs;

    await this.getTasks();
    await this.updateColumns();
  }

  async getTasks() {
    await this.postService.getGroupPosts(this.groupData?._id, 'task', null)
      .then((res) => {
        this.tasks = res['posts'];
      });
  }

  updateColumns() {
    let index = this.customFields.findIndex(cf => cf.name == this.selectTypeCF);
    this.selectTypeCustomField = this.customFields[index];
    this.selectTypeCustomField.values.forEach(cfValue => {
      let tableRow = { selectValue: cfValue, inputTypeCustomFields: [] };
      this.tableData.push(tableRow);
    });

    this.inputTypeCFs.forEach(cfName => {
      index = this.customFields.findIndex(field => field.name == cfName);
      if (index >= 0) {
        const field = this.customFields[index];
        this.inputTypeCustomFields.push(field);
      }
    });

    this.tableData.forEach(row => {
      this.inputTypeCustomFields.forEach(cf => {
        let sum = 0;

        this.tasks.forEach(task => {
          if (task.task.custom_fields
              && (task.task.custom_fields[this.selectTypeCF] && task.task.custom_fields[this.selectTypeCF] == row.selectValue)
              && (task.task.custom_fields[cf.name] && !isNaN(task.task.custom_fields[cf.name]))) {

            sum += +task.task.custom_fields[cf.name];
          }
        });
        row.inputTypeCustomFields.push(sum);
      });
    });
  }

  openSettingsDialog() {
    const data = {
      groupId: this.groupData._id,
      customFields: this.customFields,
      selectTypeCF: this.selectTypeCF,
      inputTypeCFs: this.inputTypeCFs
    }

    const dialogRef = this.dialog.open(CustomFieldsTableSettingsDialogComponent, {
      data: data,
      panelClass: 'groupCreatePostDialog',
      width: '50%',
      disableClose: true,
      hasBackdrop: true
    });

    const saveEventSubs = dialogRef.componentInstance.saveEvent.subscribe((data) => {
      this.selectTypeCF = data.selectTypeCF;
      this.inputTypeCFs = data.inputTypeCFs;
      this.updateColumns();
    });

    dialogRef.afterClosed().subscribe(result => {
      saveEventSubs.unsubscribe();
    });
  }
}
