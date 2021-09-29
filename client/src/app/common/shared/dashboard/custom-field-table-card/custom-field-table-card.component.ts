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

  selectTypeCustomFields = [];
  inputTypeCustomFields = []

  selectTypeCFs = [];
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

    this.selectTypeCFs = this.groupData?.custom_fields_table_widget?.selectTypeCFs;
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
    if (this.selectTypeCFs && this.inputTypeCFs) {
      // Clean the table arrays
      this.tableData = [];
      this.selectTypeCustomFields = [];
      this.inputTypeCustomFields = [];

      // Prepare the header row
      this.selectTypeCFs.forEach(selectCF => {
        const index = this.customFields.findIndex(cf => cf.name == selectCF);
        if (index >= 0) {
          this.selectTypeCustomFields.push(this.customFields[index]);
        }
      });

      this.inputTypeCFs.forEach(inputCF => {
        const index = this.customFields.findIndex(cf => cf.name == inputCF);
        if (index >= 0) {
          this.inputTypeCustomFields.push(this.customFields[index]);
        }
      });

      // Map only the CF properties from the tasks
      const tasks = this.tasks.map(task => {
        return task.task.custom_fields;
      }).filter(cf => cf);

      // Map the CF as needed for the table
      let tasksCFs= [];
      tasks.forEach(task => {
        let value = {};

        // check if all selectTypes are empty
        let addTask = false;
        this.selectTypeCFs.forEach(cfName => {
          if (task[cfName]) {
            addTask = true;
          }
        });

        if (addTask) {
          this.selectTypeCFs.forEach(cfName => {
            value[cfName] = task[cfName];
          });

          this.inputTypeCFs.forEach(cfName => {
            value[cfName] = task[cfName];
          });

          if (Object.keys(value).length > 0) {
            tasksCFs.push(value);
          }
        }
      });

      const selectTypeCFsTmp = this.selectTypeCFs;
      const inputTypeCFsTmp = this.inputTypeCFs;
      let row = {};
      this.tableData = tasksCFs.reduce((r, o) => {
        let key = '';
        for (let i = 0; i < selectTypeCFsTmp.length; i++) {
          key += o[selectTypeCFsTmp[i]] + '-';
        }

        if(!row[key]) {
          row[key] = Object.assign({}, o); // create a copy of o
          r.push(row[key]);
        } else {
          inputTypeCFsTmp.forEach(itCF => {
            if (itCF && itCF.name) {
              row[key][itCF.name] += o[itCF.name];
            }
          });
        }
        return r;
      }, []);
    }

    // Add a totals row
    let row = {};
    if (this.tableData && this.tableData[0]) {
      row[this.selectTypeCFs[0]] = $localize`:@@cfTableCard.total:TOTAL`;

      this.transpose(this.tableData).forEach((column, index) => {
        if (index >= this.selectTypeCFs.length) {
          row[this.inputTypeCFs[index - this.selectTypeCFs.length]] = column.reduce((sum, current) => sum + (+current), 0);
        }
      });
      this.tableData.push(row);
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
      selectTypeCFs: this.selectTypeCFs,
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
      this.selectTypeCFs = data.selectTypeCFs;
      this.inputTypeCFs = data.inputTypeCFs;

      if (!this.groupData.custom_fields_table_widget) {
        this.groupData.custom_fields_table_widget = {
          selectTypeCFs: this.selectTypeCFs,
          inputTypeCFs: this.inputTypeCFs
        };
      }
      this.groupData.custom_fields_table_widget.selectTypeCFs = this.selectTypeCFs;
      this.groupData.custom_fields_table_widget.inputTypeCFs = this.inputTypeCFs;

      await this.publicFunctions.sendUpdatesToGroupData(this.groupData);

      this.updateTable();
    });

    dialogRef.afterClosed().subscribe(result => {
      saveEventSubs.unsubscribe();
    });
  }

  getBackgroundColor(row: any, cfName: string) {
    const index = this.customFields.findIndex(cf => cf.name == cfName);
    const cf = this.customFields[index];
    const valueIndex = cf.values.findIndex(value => value == row[cfName]);
    if (row[cfName] && valueIndex >= 0) {
      return cf?.badge_color
    }
    return '';
  }
}
