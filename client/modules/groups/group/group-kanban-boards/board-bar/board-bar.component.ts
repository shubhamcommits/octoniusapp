import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { CustomFieldsDialogComponent } from '../../custom-fields-dialog/custom-fields-dialog.component';

@Component({
  selector: 'app-board-bar',
  templateUrl: './board-bar.component.html',
  styleUrls: ['./board-bar.component.scss']
})
export class BoardBarComponent implements OnInit {

  constructor(
      public dialog: MatDialog
    ) {}

  // GroupData Variable
  @Input() groupData: any;

  @Input() isAdmin = false;

  // Emitter to notify that the view is changing
  @Output() changeViewEmitter: EventEmitter<string> = new EventEmitter<string>();

  // Emitter to notify that a customField was edited/added
  @Output() customFieldEmitter= new EventEmitter();

  ngOnInit() {
  }

  changeView(view: string) {
    this.changeViewEmitter.emit(view);
  }

  openCustomFieldsDialog(): void {
    const dialogRef = this.dialog.open(CustomFieldsDialogComponent, {
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
}
