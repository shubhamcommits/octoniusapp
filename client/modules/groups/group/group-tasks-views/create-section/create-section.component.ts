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
  @Output() sectionEmitter = new EventEmitter();

  ngOnInit() {
  }

  /**
   * This function is responsible for enabling enter and espace function keys
   * @param $event
   * @param section
   */
  enableFunctionKeys($event: any){
    if($event.keyCode == 13){
      this.openCreateSection()
      this.showCreateSection = false
    } else if($event.keyCode == 27){
      this.showCreateSection = false;
    }
  }


  createNewSection(title: string) {
    this.sectionEmitter.emit({
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
