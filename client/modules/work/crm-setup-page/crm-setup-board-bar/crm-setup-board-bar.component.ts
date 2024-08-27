import { Component, OnInit, Input, Injector, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { CRMCustomFieldsDialogComponent } from '../crm-custom-fields-dialog/crm-custom-fields-dialog.component';

@Component({
  selector: 'app-crm-setup-board-bar',
  templateUrl: './crm-setup-board-bar.component.html',
  styleUrls: ['./crm-setup-board-bar.component.scss']
})
export class CRMSetupBoardBarComponent implements OnInit {

  @Input() workspaceData;
  @Input() isAdmin = false;

  @Output() contactCreated = new EventEmitter();
  @Output() contactEdited = new EventEmitter();
  @Output() companyCreated = new EventEmitter();
  @Output() companyEdited = new EventEmitter();
  @Output() customFieldEmitter = new EventEmitter();

  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public dialog: MatDialog,
    private injector: Injector
  ) { }

  async ngOnInit() {
  }

  openCustomFieldsDialog() {
    const dialogRef = this.dialog.open(CRMCustomFieldsDialogComponent, {
      minWidth: '100%',
      width: '100%',
      minHeight: '100%',
      height: '100%',
      disableClose: true,
      data: {
        workspaceData: this.workspaceData
      }
    });

    const sub = dialogRef.componentInstance.customFieldsEvent.subscribe((data) => {
      this.customFieldEmitter.emit(data);
    });

    dialogRef.afterClosed().subscribe(result => {
      sub.unsubscribe();
    });
  }
}
