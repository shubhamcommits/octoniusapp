import { Component, EventEmitter, Input, OnInit, Output, ViewChild, Injector } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'post-comment',
  templateUrl: './post-comment.component.html',
  styleUrls: ['./post-comment.component.scss']
})
export class PostCommentComponent implements OnInit {

  constructor(
    private injector: Injector
  ) { }

  // Baseurl
  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  // GroupId Input Variable
  @Input('groupId') groupId: any

  // Index of the comment inside the comment variable
  @Input('index') index: any

  // User Data Vaiable
  @Input('userData') userData: any;

  // Post Comment Variable
  @Input('comment') comment = {
    _id: '',
    likes_count: 0,
    _liked_by: [],
    content: '',
    _commented_by: {
      profile_pic: '',
      first_name: '',
      last_name: ''
    },
    created_date: new Date(Date.now())
  }

  // Remove Comment Event Emitter
  @Output('remove') remove = new EventEmitter();

  // Display Comment editor variable
  displayCommentEditor: boolean = false;

  // Quill Data 
  quillData: any;

  ngOnInit() {
  }

  /**
   * This function is responsible for feeding the quill data from current instance
   * @param quillData 
   */
  getQuillData(quillData: any) {
    this.quillData = quillData;
  }

  saveCommentData() {
    this.comment.content = JSON.stringify(this.quillData.contents)
    this.displayCommentEditor = false
  }

  deleteComment(index: number) {

    // Utility Service Instancr
    let utilityService = this.injector.get(UtilityService);

    // Ask User to delete the group or not
    utilityService.getConfirmDialogAlert()
      .then((result) => {
        if (result.value) {
          this.remove.emit(index)
          utilityService.warningNotification('Comment Removed!');
        }
      })
  }

}

