import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { CommentService } from 'src/shared/services/comment-service/comment.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import moment from 'moment/moment';
@Component({
  selector: 'comment-section',
  templateUrl: './comment-section.component.html',
  styleUrls: ['./comment-section.component.scss']
})
export class CommentSectionComponent implements OnInit {

  @Input('editorId') editorId: any
  @Input('groupId') groupId: any;
  @Input('workspaceId') workspaceId: any;
  @Input('userData') userData: any
  @Input('postId') postId: any;
  @Input('storyId') storyId: any;
  @Input('pageId') pageId: any;

  @Output('comment') comment: any = new EventEmitter()
  @Output('close') close: any = new EventEmitter();

  // Quill Data Variable
  quillData: any

  _content_mentions: any;

  // Files Variable
  files: any = []

  // Cloud files
  cloudFiles: any = [];

  constructor(
    private utilityService: UtilityService,
    private commentService: CommentService
  ) { }

  ngOnInit() {
  }

  /**
   * This function is responsible for feeding the quill data from current instance
   * @param quillData
   */
  getQuillData(quillData: any){
    this.quillData = quillData
  }

  /**
   * This function is resposible for creating the comment
   * @param userId
   */
  async create(userId: string){
    let content = '';
    if (this.quillData) {
      content = JSON.stringify(this.quillData.contents);

      // Filter the Mention users content and map them into arrays of Ids
      this._content_mentions = this.quillData.mention.users.map((user)=> user.insert.mention.id)

      // If content mentions has 'all' then only pass 'all' inside the array
      if(this._content_mentions.includes('all'))
        this._content_mentions = ['all']

      // Set the values of the array
      this._content_mentions = Array.from(new Set(this._content_mentions))
    }

    let commentData = {
      _id: null,
      content: content,
      created_date: moment().format(),
      likes_count: 0,
      _liked_by: [],
      _commented_by:{
        _id: userId,
        profile_pic: this.userData.profile_pic,
        first_name: this.userData.first_name,
        last_name: this.userData.last_name
      },
      files: [],
      _content_mentions: this._content_mentions,
      _postId: this.postId,
      _storyId: this.storyId,
      _pageId: this.pageId,
      _highlighted_content_range: []
    }

    // Create FormData Object
    let formData = new FormData();

    // Append all the file attachments
    if (this.files.length != 0) {
      for (let index = 0; index < this.files.length; index++) {
        let file  = this.files[index];
        let modified_name = Date.now().toString() + file.name;
        file.modified_name = modified_name;

        formData.append('attachments', file, file.name);

        commentData.files.push({modified_name: file.modified_name, original_name: file.name});
      }
    } else {
      delete commentData.files;
    }

    // Append Comment Data
    formData.append('comment', JSON.stringify(commentData));

    if ((content && content !== '') || this.files.length > 0) {
      await this.utilityService.asyncNotification($localize`:@@commentSection.pleaseWaitUpdatingContents:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
        if (this.pageId) {
          this.commentService.newCommentPage(formData, this.pageId)
            .then((res) => {
              // Emit the Comment to the other compoentns
              this.comment.emit(res['comment']);
              // Resolve with success
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@commentSection.commentAdded:Comment added!`));
            })
            .catch(() => {
              reject(this.utilityService.rejectAsyncPromise($localize`:@@commentSection.unableToSubmitComment:Unable to submit the comment, please try again!`));
            });
        } else {
          this.commentService.newCommentPage(formData, this.pageId)
            .then((res) => {
              // Emit the Comment to the other compoentns
              this.comment.emit(res['comment']);
              // Resolve with success
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@commentSection.commentAdded:Comment added!`));
            })
            .catch(() => {
              reject(this.utilityService.rejectAsyncPromise($localize`:@@commentSection.unableToSubmitComment:Unable to submit the comment, please try again!`));
            });
        }
      }));
    }
  }

  /**
   * This function is responsible for receiving the files
   * @param files
   */
  onAttach(files: any) {
    // Set the current files variable to the output of the module
    this.files = files;
  }

  /**
   * This function is responsible for receiving the files
   * @param files
   */
  onCloudFileAttach(cloudFiles: any) {
    // Set the current files variable to the output of the module
    this.cloudFiles = cloudFiles;

    // this.updateDetails();
  }

}
