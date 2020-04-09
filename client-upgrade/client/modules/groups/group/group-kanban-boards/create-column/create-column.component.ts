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

  // Output Created Column
  @Output('column') column = new EventEmitter();

  ngOnInit() {
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
      inputPlaceholder: 'Try to add a short name',
      inputAttributes: {
        maxlength: 20,
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      imageUrl: imageUrl,
      imageAlt: title,
      confirmButtonText: title,
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      cancelButtonColor: '#d33',
    })
  }

/**
 * This function creates the new column
 */
  async openCreateColumnModal() {
    const { value: value } = await this.openModal('Create New Column', '/assets/images/create-group.svg');
    if (value) {

      this.createNewColumn(value)

    } else if (value == '') {
      this.utilityService.warningNotification('Column name can\'t be empty!');
    }
  }

}
