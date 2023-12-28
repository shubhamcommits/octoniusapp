import { Component, OnInit, Input, Injector, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { NewCRMContactDialogComponent } from '../new-crm-contact-dialog/new-crm-contact-dialog.component';
import { NewCRMCompanyDialogComponent } from '../new-crm-company-dialog/new-crm-company-dialog.component';
import { CRMCustomFieldsDialogComponent } from '../crm-custom-fields-dialog/crm-custom-fields-dialog.component';

@Component({
  selector: 'app-crm-setup-board-bar',
  templateUrl: './crm-setup-board-bar.component.html',
  styleUrls: ['./crm-setup-board-bar.component.scss']
})
export class CRMSetupBoardBarComponent implements OnInit {

  @Input() groupData;
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

  // openNewContactDialog() {
  //   const dialogRef = this.dialog.open(NewCRMContactDialogComponent, {
  //     disableClose: true,
  //     hasBackdrop: true,
  //     width: '75%',
  //     height: '85%'
  //   });

  //   const contactEditedSubs = dialogRef.componentInstance.contactEdited.subscribe(async (data) => {
  //     this.contactEdited.emit(data);
  //   });

  //   const contactCreatedSubs = dialogRef.componentInstance.contactCreated.subscribe(async (data) => {
  //     this.contactCreated.emit(data);
  //   });

  //   dialogRef.afterClosed().subscribe(async result => {
  //     contactEditedSubs.unsubscribe();
  //     contactCreatedSubs.unsubscribe();
  //   });
  // }

  // openNewCompanyDialog() {
  //   const dialogRef = this.dialog.open(NewCRMCompanyDialogComponent, {
  //     disableClose: true,
  //     hasBackdrop: true,
  //     width: '50%'
  //   });

  //   const companyEditedSubs = dialogRef.componentInstance.companyEdited.subscribe(async (data) => {
  //     this.companyEdited.emit(data);
  //   });

  //   const companyCreatedSubs = dialogRef.componentInstance.companyCreated.subscribe(async (data) => {
  //     this.companyCreated.emit(data);
  //   });

  //   dialogRef.afterClosed().subscribe(async result => {
  //     companyEditedSubs.unsubscribe();
  //     companyCreatedSubs.unsubscribe();
  //   });
  // }

  openCustomFieldsDialog() {
    const dialogRef = this.dialog.open(CRMCustomFieldsDialogComponent, {
      width: '100%',
      height: '100%',
      disableClose: true,
      data: {
        groupData: this.groupData,
        workspaceId: (this.groupData._workspace._id || this.groupData._workspace)
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
