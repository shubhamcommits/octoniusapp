import { Component, OnInit, Input } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-group-post-selection',
  templateUrl: './group-post-selection.component.html',
  styleUrls: ['./group-post-selection.component.scss']
})
export class GroupPostSelectionComponent implements OnInit {

  constructor(
    private utilityService: UtilityService,
  ) { }

  // UserData Object
  @Input('userData') userData: any;

  // GroupId variable
  @Input('groupId') groupId: any;

  // Post Type
  type: string

  ngOnInit() {

  }

  openModal(content: any){
    this.utilityService.openModal(content, {
      size: 'xl',
    });
  }

  /**
   * This function closes all the modals
   */
  closeModal(){
    this.utilityService.closeAllModals();
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return !(JSON.stringify(object) === JSON.stringify({}))
  }

}
