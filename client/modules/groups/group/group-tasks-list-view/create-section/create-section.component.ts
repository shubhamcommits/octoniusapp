import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-create-section',
  templateUrl: './create-section.component.html',
  styleUrls: ['./create-section.component.scss']
})
export class CreateSectionComponent implements OnInit {

  constructor(
    public utilityService: UtilityService
  ) { }

  // Show Create Section Variable
  showCreateSection = false

  // newSection variable
  newSection: any

  // Output Created Section
  @Output() section = new EventEmitter();

  ngOnInit() {
  }


  createNewSection(title: string) {
    this.section.emit({
      title: title,
      taskCount: 0,
      tasks: []
    })
  }

/**
 * This function opens the Swal modal to create Sections
 * @param title
 * @param imageUrl
 */
  openModal(title: string, imageUrl: string) {
    return this.utilityService.getSwalModal({
      title: title,
      input: 'text',
      inputPlaceholder: $localize`:@@createSection.tryAddShortName:Try to add a short name`,
      inputAttributes: {
        maxlength: 20,
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      imageUrl: imageUrl,
      imageAlt: title,
      confirmButtonText: title,
      showCancelButton: true,
      cancelButtonText: $localize`:@@createSection.cancel:Cancel`,
      cancelButtonColor: '#d33',
    })
  }

/**
 * This function creates the new section
 */
  async openCreateSection() {

    if (this.newSection) {

      this.createNewSection(this.newSection)
      this.newSection = undefined

    } else if (this.newSection == '') {
      this.utilityService.warningNotification($localize`:@@createSection.sectionNameNotEmpty:Section name can\'t be empty!`);
    }
  }

}
