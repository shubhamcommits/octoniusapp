import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-group-post-selection',
  templateUrl: './group-post-selection.component.html',
  styleUrls: ['./group-post-selection.component.scss'],
  encapsulation: ViewEncapsulation.None,
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

  // Output the post received from component
  @Output('post') post = new EventEmitter()

  // Output edited post
  @Output('edited') edited = new EventEmitter();

  ngOnInit() {

  }

  openModal(type: string) {
    // this.utilityService.openModal(content, {});
    const dialogRef = this.utilityService.openCreatePostDialog(this.groupId, this.userData, null, false, null, type);

    if (dialogRef) {
      const postEventSubs = dialogRef.componentInstance.post.subscribe((data) => {
        this.getPost(data);
      });

      const editedEventSubs = dialogRef.componentInstance.edited.subscribe((data) => {
        this.editedPost(data);
      });

      const closeEventSubs = dialogRef.componentInstance.close.subscribe((data) => {
        this.closeModal();
      });
      
      dialogRef.afterClosed().subscribe(result => {
        closeEventSubs.unsubscribe();
        postEventSubs.unsubscribe();
        editedEventSubs.unsubscribe();
      });
    }
  }

  /**
   * This function is responsible for emitting the post object to other components
   * @param post
   */
  getPost(post: any) {

    // Emit the post to other connected components
    this.post.emit(post)
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

  editedPost(post: any){
    this.edited.emit(post);
  }
}
