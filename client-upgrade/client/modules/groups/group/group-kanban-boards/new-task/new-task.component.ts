import { Component, OnInit, Input } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-new-task',
  templateUrl: './new-task.component.html',
  styleUrls: ['./new-task.component.scss']
})
export class NewTaskComponent implements OnInit {

  constructor(
    public utilityService: UtilityService
  ) { }

  // Column as the Input object
  @Input('column') column: any

  ngOnInit() {
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
      inputPlaceholder: 'Add your task title here',
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
  * This function creates the new task inside a column
  */
  async openCreateTaskModal() {
    const { value: value } = await this.openModal('Create New Task', '/assets/images/create-group.svg');
    if (value) {

    } else if (value == '') {
      this.utilityService.warningNotification('Task title can\'t be empty!');
    }
  }

}
