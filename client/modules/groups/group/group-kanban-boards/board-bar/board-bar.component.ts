import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AutomationFlowsDialogComponent } from '../../automation-flows-dialog/automation-flows-dialog.component';
import { CustomFieldsDialogComponent } from '../../custom-fields-dialog/custom-fields-dialog.component';

@Component({
  selector: 'app-board-bar',
  templateUrl: './board-bar.component.html',
  styleUrls: ['./board-bar.component.scss']
})
export class BoardBarComponent implements OnInit {

  constructor(
    public dialog: MatDialog
  ) { }

  // GroupData Variable
  @Input() groupData: any;
  @Input() sections = [];
  @Input() isAdmin = false;
  @Input() customFields = [];
  @Input() userData;
  groupMembers:any = []
  // Emitter to notify that the view is changing
  @Output() changeViewEmitter: EventEmitter<string> = new EventEmitter<string>();

  // Emitter to notify that the sorting type is changing
  @Output() sortTaskEmitter: EventEmitter<string> = new EventEmitter<string>();

  // Emitter to notify that the filter type is changing
  @Output() filterTaskEmitter: EventEmitter<Object> = new EventEmitter<Object>();

  // Emitter to notify that a customField was edited/added
  @Output() customFieldEmitter = new EventEmitter();

  sortby: String = 'none'
  filterfor: String = 'none'
  menuLable:string='Filter Task For';
  menuFor:string='Filter';

  ngOnInit() {
    
    if(this.groupData._admins.length>0){
      this.groupData._admins.forEach(element => {
        this.groupMembers.push(element);
      });
    }
    if(this.groupData._members.length>0){
      this.groupData._members.forEach(element => {
        this.groupMembers.push(element);
      });
    }
  }

  changeView(view: string) {
    this.changeViewEmitter.emit(view);
  }

  sortTasks(bit: string) {
    this.sortby = bit;
    this.sortTaskEmitter.emit(bit);
  }

  filterTask(bit: string){
    this.filterfor = bit;
    const obj={bit:bit,data:''}
    this.filterTaskEmitter.emit(obj);
  }

  async onUserSelctionEmitter(userId:string){
    this.filterfor='users';
    const obj={bit:'users',data:userId}
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
}
