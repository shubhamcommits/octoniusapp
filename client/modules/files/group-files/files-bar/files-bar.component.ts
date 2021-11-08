import { Component, OnInit, Input, Output, EventEmitter, Injector } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FilesCustomFieldsDialogComponent } from 'modules/groups/group/files-custom-fields-dialog/files-custom-fields-dialog.component';
import { PublicFunctions } from 'modules/public.functions';

@Component({
  selector: 'app-files-bar',
  templateUrl: './files-bar.component.html',
  styleUrls: ['./files-bar.component.scss']
})
export class FilesBarComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
    private injector: Injector
  ) { }

  // GroupData Variable
  @Input() groupData: any;
  @Input() userData;

  isAdmin = true;

  // Emitter to notify that a customField was edited/added
  @Output() customFieldEmitter = new EventEmitter();

  public publicFunctions = new PublicFunctions(this.injector);

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

  isAdminUser() {
    const index = (this.groupData && this.groupData._admins) ? this.groupData._admins.findIndex((admin: any) => admin._id === this.userData._id) : -1;
    return index >= 0;
  }
}
