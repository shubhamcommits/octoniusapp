import { Component, Injector, Input, OnChanges, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { PostService } from 'src/shared/services/post-service/post.service';
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

  selectTypeCF: any;
  inputTypeCFs = [];

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector)

  constructor(
    private postService: PostService,
    private injector: Injector,
    public dialog: MatDialog
  ) { }

  async ngOnChanges() {
    await this.getTasks();
  }

  async getTasks() {
    await this.postService.getGroupPosts(this.groupData?._id, 'task', this.period, false)
    .then((res) => {
      this.tasks = res['posts'];
    });
  }

  openSettingsDialog() {
    const data = {
      groupId: this.groupData._id,
      customFields: this.customFields,
      selectTypeCF: this.groupData?.custom_fields_table_widget?.selectTypeCF,
      inputTypeCFs: this.groupData?.custom_fields_table_widget?.inputTypeCFs
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
    });

    dialogRef.afterClosed().subscribe(result => {
      saveEventSubs.unsubscribe();
    });
  }
}
