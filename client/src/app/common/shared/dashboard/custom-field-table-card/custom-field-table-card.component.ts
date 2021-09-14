import { Component, Injector, OnChanges, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { PostService } from 'src/shared/services/post-service/post.service';
import { CustomFieldsTableSettingsDialogComponent } from './custom-fields-table-settings-dialog/custom-fields-table-settings-dialog.component';

@Component({
  selector: 'app-custom-field-table-card',
  templateUrl: './custom-field-table-card.component.html',
  styleUrls: ['./custom-field-table-card.component.scss']
})
export class CustomFieldTableCardComponent implements OnChanges, OnInit {

  // Current Workspace Data
  //workspaceData: any;

  groupData: any;
  customFields = [];

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
  ) {}

  ngOnInit() {
    this.initData();
  }

  ngOnChanges() {
    this.initData();
  }

  async initData() {
    this.groupData = await this.publicFunctions.getCurrentGroup();
    this.customFields = this.groupData?.custom_fields;

    this.selectTypeCF = this.groupData?.custom_fields_table_widget?.selectTypeCF;
    this.inputTypeCFs = this.groupData?.custom_fields_table_widget?.inputTypeCFs;

    await this.getTasks();
    await this.updateTable();
  }

  async getTasks() {
    await this.postService.getGroupPosts(this.groupData?._id, 'task', null)
      .then((res) => {
        this.tasks = res['posts'];
      });
  }

  updateTable() {
    this.inputTypeCustomFields = [];
    this.tableData = [];

    let index = this.customFields.findIndex(cf => cf.name == this.selectTypeCF);
    if (index >= 0) {
      this.selectTypeCustomField = this.customFields[index];
      this.selectTypeCustomField.values.forEach(cfValue => {
        let tableRow = { selectValue: cfValue, inputTypeCustomFields: [] };
        this.tableData.push(tableRow);
      });
    } else {
      this.selectTypeCustomField = null;
    }

    if (this.inputTypeCFs) {
      this.inputTypeCFs.forEach(cfName => {
        index = this.customFields.findIndex(field => field.name == cfName);
        if (index >= 0) {
          const field = this.customFields[index];
          this.inputTypeCustomFields.push(field);
        }
      });
    } else {
      this.inputTypeCFs = [];
    }

    let totals = [];

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

    if (this.tableData && this.tableData[0]) {
      const tableTransposed = this.transpose(this.tableData);
      const columns = tableTransposed[tableTransposed.length-1];
      if (columns && columns[0]) {
        for (let col = 0; col < columns[0].length; col++) {
          let colSum = 0;
          for (let row = 0; row < columns.length; row++) {
            if (columns[row] && columns[row][col] && !isNaN(columns[row][col])) {
              colSum += +columns[row][col];
            }
          }
          totals.push(colSum);
        }
      }
      this.tableData.push({ selectValue: $localize`:@@cfTableCard.total:TOTAL`, inputTypeCustomFields: totals });
    }
  }

  transpose(a) {
    return Object.keys(a[0]).map((c) => {
      return a.map((r) => {
        return r[c];
      });
    });
  }

  openSettingsDialog() {
    const data = {
      groupId: this.groupData?._id,
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

    const saveEventSubs = dialogRef.componentInstance.saveEvent.subscribe(async (data) => {
      this.selectTypeCF = data.selectTypeCF;
      this.inputTypeCFs = data.inputTypeCFs;

      if (!this.groupData.custom_fields_table_widget) {
        this.groupData.custom_fields_table_widget = {
          selectTypeCF: this.selectTypeCF,
          inputTypeCFs: this.inputTypeCFs
        };
      }
      this.groupData.custom_fields_table_widget.selectTypeCF = this.selectTypeCF;
      this.groupData.custom_fields_table_widget.inputTypeCFs = this.inputTypeCFs;

      await this.publicFunctions.sendUpdatesToGroupData(this.groupData);

      this.updateTable();
    });

    dialogRef.afterClosed().subscribe(result => {
      saveEventSubs.unsubscribe();
    });
  }
}
