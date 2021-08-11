import { Component, OnInit, Input, Output, EventEmitter, Injector } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { AutomationFlowsDialogComponent } from '../../automation-flows-dialog/automation-flows-dialog.component';
import { CustomFieldsDialogComponent } from '../../custom-fields-dialog/custom-fields-dialog.component';
import { AdvancedFilterDialogComponent } from './advanced-filter-dialog/advanced-filter-dialog.component';

@Component({
  selector: 'app-board-bar',
  templateUrl: './board-bar.component.html',
  styleUrls: ['./board-bar.component.scss']
})
export class BoardBarComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
    private injector: Injector
  ) { }

  // GroupData Variable
  @Input() groupData: any;
  @Input() sections = [];
  @Input() isAdmin = false;
  @Input() customFields = [];
  @Input() userData;
  @Input() viewType;
  @Input() isIdeaModuleAvailable;

  // Emitter to notify that the view is changing
  @Output() changeViewEmitter: EventEmitter<string> = new EventEmitter<string>();

  // Emitter to notify that the sorting type is changing
  @Output() sortTaskEmitter: EventEmitter<string> = new EventEmitter<string>();

  // Emitter to notify that the filter type is changing
  @Output() filterTaskEmitter: EventEmitter<Object> = new EventEmitter<Object>();

  // Emitter to notify that a customField was edited/added
  @Output() customFieldEmitter = new EventEmitter();

  public publicFunctions = new PublicFunctions(this.injector);

  sortby: string = 'none'
  filterfor: string = 'none'
  menuLable: string = $localize`:@@boardBar.filterTaskFor:Filter Task For`;
  menuFor: string = 'Filter';
  reverse: boolean = false;
  cfFilter: any = {}

  groupMembers:any = [];

  async ngOnInit() {
    this.groupMembers = await this.publicFunctions.getCurrentGroupMembers();
  }

  changeView(view: string) {
    this.changeViewEmitter.emit(view);
  }

  sortTasks(bit: string) {
    if(bit==this.sortby){
      if(this.reverse==false){
        this.reverse = true;
        this.sortTaskEmitter.emit('reverse');
      } else if(this.reverse==true){
        this.reverse = false;
        this.sortTaskEmitter.emit('invert');
      }

    } else {
      this.sortby = bit;
      this.reverse = false;
      this.sortTaskEmitter.emit(bit);
    }

  }

  filterTask(bit: string, cf?: any) {
    this.filterfor = bit;
    this.cfFilter = (cf) ? cf : {};
    const obj = { bit: bit, data: this.cfFilter || '' }
    this.filterTaskEmitter.emit(obj);
  }

  async onUserSelctionEmitter(userId:string){
    this.filterfor='users';
    const obj={ bit: 'users', data: userId }
    this.filterTaskEmitter.emit(obj);
  }

  openCustomFieldsDialog(): void {
    const dialogRef = this.dialog.open(CustomFieldsDialogComponent, {
      width: '100%',
      height: '100%',
      disableClose: true,
      data: { groupData: this.groupData, workspaceId: this.groupData._workspace }
    });
    const sub = dialogRef.componentInstance.customFieldsEvent.subscribe((data) => {
      this.customFieldEmitter.emit(data);
    });
    dialogRef.afterClosed().subscribe(result => {
      sub.unsubscribe();
    });
  }

  openAutomatorDialog() {
    const dialogRef = this.dialog.open(AutomationFlowsDialogComponent, {
      width: '100%',
      height: '100%',
      disableClose: true,
      data: { groupId: this.groupData._id, groupSections: this.sections, customFields: this.customFields }
    });
  }

  openAdvancedFilterDialog() {
    const dialogRef = this.dialog.open(AdvancedFilterDialogComponent, {
      width: '50%',
      height: '75%',
      disableClose: true,
      hasBackdrop: true,
      data: { groupData: this.groupData, cf: this.cfFilter }
    });
    const sub = dialogRef.componentInstance.customFieldEvent.subscribe((data) => {
      if (data.name != '' && data.valu != '') {
        this.filterTask('custom_field', data);
      } else {
        this.filterTask('none');
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      sub.unsubscribe();
    });
  }
}
