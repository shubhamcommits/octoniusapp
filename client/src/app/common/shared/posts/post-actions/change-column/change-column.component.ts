import { Component, OnChanges, Input, Output, EventEmitter, Injector, SimpleChanges } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-change-column',
  templateUrl: './change-column.component.html',
  styleUrls: ['./change-column.component.scss']
})
export class ChangeColumnComponent implements OnChanges {

  // Post Input Variable
  @Input() sectionId: string;

  // Columns Input Variable
  @Input() columns: any;

  @Input() disabled: boolean = false;

  // Move Task Output Emitter
  @Output('moveTask') moveTask = new EventEmitter();

  selectedColumn: any;

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    private injector: Injector
  ) { }

  async ngOnChanges() {
    this.selectColumn(this.sectionId);
  }

  /**
   * This function replicates the functioanlity of CDK Drag and Drop Event
   * @param post
   * @param oldColumn
   * @param newColumn
   * Hence emits an message to the parent when the task is moved from one column to another via dropdown
   */
  sendMoveTaskMessage(oldColumn: string, newColumnId: string) {
    this.sectionId = newColumnId
    this.selectColumn(newColumnId);

    // Emit the new task column state
    this.moveTask.emit({
      oldColumn, newColumnId
    });
  }

  selectColumn(columnId) {
    if (this.columns) {
      const columnIndex = this.columns.findIndex(column => column._id ==  columnId);
      this.selectedColumn = this.columns[columnIndex];
    }
  }
}
