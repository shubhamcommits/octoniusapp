import { Component, OnInit, Input, Output, EventEmitter, Injector, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FilesCustomFieldsDialogComponent } from 'modules/groups/group/files-custom-fields-dialog/files-custom-fields-dialog.component';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { FilesSettingsDialogComponent } from '../files-settings-dialog/files-settings-dialog.component';
import { ManagementPortalService } from 'src/shared/services/management-portal-service/management-portal.service';

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
  // Emitter to notify that the sorting type is changing
  @Output() sortEmitter: EventEmitter<Object> = new EventEmitter<Object>();
  // Emitter to notify that the filter type is changing
  @Output() filterEmitter: EventEmitter<Object> = new EventEmitter<Object>();

  isAdmin = true;

  isIndividualSubscription = true;

  sortby: string = 'none';
  filterfor: string = 'none';
  reverse: boolean = false;
  cfFilter: any = {};
  cfSort: any = {};
  groupMembers:any = [];
  customFields = [];
  menuLable: string = $localize`:@@filesBar.filterFor:Filter For`;
  menuFor: string = 'Filter';
  selectedCFFilterDate = null;
  filterCFInputValue;
  filterCFNumberInputValue;

  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public dialog: MatDialog,
    private injector: Injector,
    private managementPortalService: ManagementPortalService,
    private groupService: GroupService
  ) { }

  async ngOnInit() {
    this.isAdmin = this.isAdminUser();
    this.isIndividualSubscription = await this.publicFunctions.checkIsIndividualSubscription();

    this.customFields = [];
    this.groupService.getGroupFilesCustomFields(this.groupData?._id).then((res) => {
      if (res['group']['files_custom_fields']) {
        res['group']['files_custom_fields'].forEach(field => {
          this.customFields.push(field);
        });
      }
    });

    this.groupMembers = await this.publicFunctions.getCurrentGroupMembers();
  }

  openCustomFieldsDialog(): void {
    const dialogRef = this.dialog.open(FilesCustomFieldsDialogComponent, {
      width: '100%',
      height: '100%',
      disableClose: true,
      data: { groupData: this.groupData }
    });
    const sub = dialogRef.componentInstance.customFieldsEvent.subscribe((data) => {
      this.customFields = [...data];
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

  sort(bit: string, cf?: any) {
    if (bit == this.sortby) {
      if (cf && this.cfSort && cf.title != this.cfSort.title) {
        this.reverse = false;
        this.cfSort = (cf) ? cf : {};
        const obj = { bit: bit, data: this.cfSort || '' }
        this.sortEmitter.emit(obj);
      } else {
        if (this.reverse == false) {
          this.reverse = true;
          const obj = { bit: 'reverse' }
          this.sortEmitter.emit(obj);
        } else if (this.reverse == true) {
          this.reverse = false;
          const obj = { bit: 'inverse' }
          this.sortEmitter.emit(obj);
        }
      }
    } else {
      this.sortby = bit;
      this.reverse = false;
      this.cfSort = (cf) ? cf : {};
      const obj = { bit: bit, data: this.cfSort || '' }
      this.sortEmitter.emit(obj);
    }
  }

  filter(bit: string, cf?: any, cfValue?: any) {
    this.filterfor = bit;
    this.cfFilter = (cf && cfValue) ? {cf, cfValue} : {};
    if (cf && cfValue && cf?.input_type_date) {
      this.selectedCFFilterDate = cfValue;
      this.filterCFNumberInputValue = '';
      this.filterCFInputValue = '';
    } else if (cf && cfValue && cf?.input_type_text) {
      this.selectedCFFilterDate = null;
      this.filterCFNumberInputValue = '';
    } else if (cf && cfValue && cf?.input_type_number) {
      this.selectedCFFilterDate = null;
      this.filterCFInputValue = '';
    }
    const obj = { bit: bit, data: this.cfFilter || '' }
    if (!cf || (cf && cfValue && cfValue != '')) {
      this.filterEmitter.emit(obj);
    }
  }

  onUserSelctionEmitter(userId:string){
    this.filterfor='users';
    const obj={ bit: 'users', data: userId }
    this.filterEmitter.emit(obj);
  }

  formateCFDate(date){
    return moment(moment.utc(date), "YYYY-MM-DD").toDate();
  }
}
