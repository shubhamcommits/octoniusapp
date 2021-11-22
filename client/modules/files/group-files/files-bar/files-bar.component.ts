import { Component, OnInit, Input, Output, EventEmitter, Injector } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FilesCustomFieldsDialogComponent } from 'modules/groups/group/files-custom-fields-dialog/files-custom-fields-dialog.component';
import { PublicFunctions } from 'modules/public.functions';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { FilesSettingsDialogComponent } from '../files-settings-dialog/files-settings-dialog.component';

@Component({
  selector: 'app-files-bar',
  templateUrl: './files-bar.component.html',
  styleUrls: ['./files-bar.component.scss']
})
export class FilesBarComponent implements OnInit {

  // GroupData Variable
  @Input() groupData: any;
  @Input() userData;

  // Emitter to notify that a customField was edited/added
  @Output() customFieldEmitter = new EventEmitter();

  isAdmin = true;

  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public dialog: MatDialog,
    private injector: Injector,
    private utilityService: UtilityService,
    private groupService: GroupService
  ) { }

  async ngOnInit() {
    this.isAdmin = this.isAdminUser();
  }

  openCustomFieldsDialog(): void {
    const dialogRef = this.dialog.open(FilesCustomFieldsDialogComponent, {
      width: '100%',
      height: '100%',
      disableClose: true,
      data: { groupData: this.groupData }
    });
    const sub = dialogRef.componentInstance.customFieldsEvent.subscribe((data) => {
      this.customFieldEmitter.emit(data);
    });
    dialogRef.afterClosed().subscribe(result => {
      sub.unsubscribe();
    });
  }

  openSettingsDialog(): void {
    const dialogRef = this.dialog.open(FilesSettingsDialogComponent, {
      width: '60%',
      height: '85%',
      disableClose: true,
      hasBackdrop: true,
      data: { groupData: this.groupData }
    });
    const sub = dialogRef.componentInstance.closeEvent.subscribe((data) => {
      this.groupData = data;
      this.publicFunctions.sendUpdatesToGroupData(this.groupData);
    });
    dialogRef.afterClosed().subscribe(result => {
      sub.unsubscribe();
    });
  }

  isAdminUser() {
    const index = (this.groupData && this.groupData._admins) ? this.groupData._admins.findIndex((admin: any) => admin._id === this.userData._id) : -1;
    return index >= 0 || this.userData.role == 'owner';
  }
}
