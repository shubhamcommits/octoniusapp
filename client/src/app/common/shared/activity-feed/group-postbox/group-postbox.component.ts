import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-group-postbox',
  templateUrl: './group-postbox.component.html',
  styleUrls: ['./group-postbox.component.scss']
})
export class GroupPostboxComponent implements OnInit {

  constructor(
    private utilityService: UtilityService
    ) { }

  // BASE URL OF THE APPLICATION
  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  // GroupId variable
  @Input('groupId') groupId: any;

  // UserData Object
  @Input('userData') userData: any;

  // Output the post received from component
  @Output('post') post = new EventEmitter()

  // Output the edited post
  @Output('edited') edited = new EventEmitter()

  // Variable to showpostbox or not
  showPostBox: boolean = false;

  ngOnInit() {
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return !(JSON.stringify(object) === JSON.stringify({}))
  }

  /**
   * This function is responsible for emitting the post object to other components
   * @param post
   */
  getPost(post: any) {
    // Emit the post to other connected components
    this.post.emit(post)
  }

  editedPost(post: any){
    this.edited.emit(post);
  }

  openModal(content: any){
    this.utilityService.openModal(content, {});
  }

  /**
   * This function closes all the modals
   */
  closeModal(){
    this.utilityService.closeAllModals();
  }
}
