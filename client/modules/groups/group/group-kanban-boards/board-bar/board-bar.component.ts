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

  // Emitter to notify that the view is changing
  @Output() changeViewEmitter: EventEmitter<string> = new EventEmitter<string>();

  ngOnInit() {
  }

  changeView(view: string) {
    this.changeViewEmitter.emit(view);
  }

  openCustomFieldsDialog(): void {
    const dialogRef = this.dialog.open(CustomFieldsDialogComponent, {
      width: '80%',
      data: { groupData: this.groupData }
    });
    const sub = dialogRef.componentInstance.customFieldsEvent.subscribe((data) => {
      console.log(data);
      // TODO how to bring this information to the list view component
    });
    dialogRef.afterClosed().subscribe(result => {
      sub.unsubscribe();
    });
  }
}
