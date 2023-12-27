import { Component, OnInit, Input, Injector, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { ManagementPortalService } from 'src/shared/services/management-portal-service/management-portal.service';
import { NewCRMContactDialogComponent } from '../new-crm-contact-dialog/new-crm-contact-dialog.component';
import { NewCRMCompanyDialogComponent } from '../new-crm-company-dialog/new-crm-company-dialog.component';

@Component({
  selector: 'app-contacts-board-bar',
  templateUrl: './contacts-board-bar.component.html',
  styleUrls: ['./contacts-board-bar.component.scss']
})
export class ContactsBoardBarComponent implements OnInit {

  @Output() contactCreated = new EventEmitter();
  @Output() contactEdited = new EventEmitter();
  @Output() companyCreated = new EventEmitter();
  @Output() companyEdited = new EventEmitter();

  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public dialog: MatDialog,
    private injector: Injector
  ) { }

  async ngOnInit() {
  }

  openNewContactDialog() {
    const dialogRef = this.dialog.open(NewCRMContactDialogComponent, {
      disableClose: true,
      hasBackdrop: true,
      width: '75%',
      height: '85%'
    });

    const contactEditedSubs = dialogRef.componentInstance.contactEdited.subscribe(async (data) => {
      this.contactEdited.emit(data);
    });

    const contactCreatedSubs = dialogRef.componentInstance.contactCreated.subscribe(async (data) => {
      this.contactCreated.emit(data);
    });

    dialogRef.afterClosed().subscribe(async result => {
      contactEditedSubs.unsubscribe();
      contactCreatedSubs.unsubscribe();
    });
  }

  openNewCompanyDialog() {
    const dialogRef = this.dialog.open(NewCRMCompanyDialogComponent, {
      disableClose: true,
      hasBackdrop: true,
      width: '50%'
    });

    const companyEditedSubs = dialogRef.componentInstance.companyEdited.subscribe(async (data) => {
      this.companyEdited.emit(data);
    });

    const companyCreatedSubs = dialogRef.componentInstance.companyCreated.subscribe(async (data) => {
      this.companyCreated.emit(data);
    });

    dialogRef.afterClosed().subscribe(async result => {
      companyEditedSubs.unsubscribe();
      companyCreatedSubs.unsubscribe();
    });
  }
}
