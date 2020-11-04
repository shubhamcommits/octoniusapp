import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import { CommentService } from 'src/shared/services/comment-service/comment.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'comment-section',
  templateUrl: './comment-section.component.html',
  styleUrls: ['./comment-section.component.scss']
})
export class CommentSectionComponent implements OnInit {

  constructor(
    private utilityService: UtilityService,
    private commentService: CommentService
  ) { }

  // EditorId of the Quill Comment Content
  @Input('editorId') editorId: any

  // GroupId Input Variable
  @Input('groupId') groupId: any

  // User Data Variable
  @Input('userData') userData: any

  @Input('postId') postId: any;

  // Comment Emitter
  @Output('comment') comment: any = new EventEmitter()

  // Close Comment Editor
  @Output('close') close: any = new EventEmitter();

  // Quill Data Variable
  quillData: any

  _content_mentions: any;

  // Files Variable
  files: any = []

  // Cloud files
  cloudFiles: any = [];

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
  create(userId: string){

    let commentData = {
      content: JSON.stringify(this.quillData.contents),
      created_date: new Date(Date.now()),
      likes_count: 0,
      _liked_by: [],
      _commented_by:{
        _id: userId,
        profile_pic: this.userData.profile_pic,
        first_name: this.userData.first_name,
        last_name: this.userData.last_name
      },
      files: [],
      _content_mentions: [],
      _postId: this.postId,
      _highlighted_content_range: []
    }

    // Filter the Mention users content and map them into arrays of Ids
    this._content_mentions = this.quillData.mention.users.map((user)=> user.insert.mention.id)

    // If content mentions has 'all' then only pass 'all' inside the array
    if(this._content_mentions.includes('all'))
      this._content_mentions = ['all']

    // Set the values of the array
    this._content_mentions = Array.from(new Set(this._content_mentions))

    commentData._content_mentions = this._content_mentions;

    // Create FormData Object
    let formData = new FormData();

    // Append Comment Data
    formData.append('comment', JSON.stringify(commentData))

    // Append all the file attachments
    if (this.files.length != 0) {
      for (let index = 0; index < this.files.length; index++) {
        formData.append('attachments', this.files[index], this.files[index]['name']);
      }
    }

    this.newComment(formData);
  }

  newComment(comment: FormData) {
    this.utilityService.asyncNotification('Please wait we are creating the comment...', new Promise((resolve, reject) => {
      this.commentService.new(comment, this.postId)
        .then((res) => {
          // Emit the Comment to the other compoentns
          this.comment.emit(res['comment'])

          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise('Comment Created!'))
        })
        .catch((err) => {

          // Catch the error and reject the promise
          reject(this.utilityService.rejectAsyncPromise('Unable to create comment, please try again!'))
        })
    }));
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
