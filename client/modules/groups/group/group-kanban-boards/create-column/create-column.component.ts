import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-create-column',
  templateUrl: './create-column.component.html',
  styleUrls: ['./create-column.component.scss']
})
export class CreateColumnComponent implements OnInit {

  constructor(
    public utilityService: UtilityService
  ) { }

  // Show Create Column Variable
  showCreateColumn = false

  // newColumn variable
  newColumn: any

  // Output Created Column
  @Output('column') column = new EventEmitter();

  ngOnInit() {
  }

  /**
   * This function is responsible for enabling enter and espace function keys
   * @param $event
   * @param column
   */
  enableFunctionKeys($event: any){
    if($event.keyCode == 13){
      this.openCreateColumn()
      this.showCreateColumn = false
    } else if($event.keyCode == 27){
      this.showCreateColumn = false;
    }
  }


  createNewColumn(title: string) {
    this.column.emit({
      title: title,
      taskCount: 0,
      tasks: []
    })
  }

/**
 * This function opens the Swal modal to create Columns
 * @param title
 * @param imageUrl
 */
  openModal(title: string, imageUrl: string) {
    return this.utilityService.getSwalModal({
      title: title,
      input: 'text',
      inputPlaceholder: $localize`:@@createColumn.tryAddShortName:Try to add a short name`,
      inputAttributes: {
        maxlength: 20,
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      imageUrl: imageUrl,
      imageAlt: title,
      confirmButtonText: title,
      showCancelButton: true,
      cancelButtonText: $localize`:@@createColumn.cancel:Cancel`,
      cancelButtonColor: '#d33',
    })
  }

/**
 * This function creates the new column
 */
  async openCreateColumn() {

    if (this.newColumn) {

      this.createNewColumn(this.newColumn)
      this.newColumn = undefined

    } else if (this.newColumn == '') {
      this.utilityService.warningNotification($localize`:@@createColumn.sectionNameNotEmpty:Section name can\'t be empty!`);
    }
  }

}
