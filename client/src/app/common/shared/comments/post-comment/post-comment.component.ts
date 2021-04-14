import { Component, EventEmitter, Input, OnInit, Output, ViewChild, Injector } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { CommentService } from 'src/shared/services/comment-service/comment.service';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment/moment'

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
    files: [],
    _content_mentions: [],
    created_date: moment().format("YYYY-MM-DD")
  }

  // Remove Comment Event Emitter
  @Output('remove') remove = new EventEmitter();

  // Display Comment editor variable
  displayCommentEditor: boolean = false;

  // Quill Data
  quillData: any;

  _content_mentions: any;

  likedByUsers = [];

  // Files Variable
  files: any = []

  // Cloud files
  cloudFiles: any = [];

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  async ngOnInit() {
    if (this.comment && this.comment._liked_by) {
      await this.comment._liked_by.forEach(user => {
        (user['first_name'] && user['last_name'])
          ? this.likedByUsers.push(user['first_name'] || 'Deleted' + ' ' + user['last_name'] || 'User')
          : this.publicFunctions.getOtherUser(user._id || user).then(otherUser => {
              this.likedByUsers.push(otherUser['first_name'] + ' ' + otherUser['last_name']);
            }).catch(err => {
              this.likedByUsers.push('Deleted User');
            });
      });

    }
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
    let commentService = this.injector.get(CommentService);
    this._content_mentions = this.quillData.mention.users.map((user)=> user.insert.mention.id)

    // If content mentions has 'all' then only pass 'all' inside the array
    if(this._content_mentions.includes('all'))
      this._content_mentions = ['all']

    // Set the values of the array
    this._content_mentions = Array.from(new Set(this._content_mentions))

    this.comment._content_mentions = this._content_mentions;

    // Create FormData Object
    let formData = new FormData();

    // Append Comment Data
    formData.append('comment', JSON.stringify(this.comment))

    // Append all the file attachments
    if (this.files.length != 0) {
      for (let index = 0; index < this.files.length; index++) {
        formData.append('attachments', this.files[index], this.files[index]['name']);
      }
    }


    commentService.edit(formData, this.comment._id);
  }

  deleteComment(index: number) {

    // Utility Service Instancr
    let utilityService = this.injector.get(UtilityService);

    // Ask User to delete the group or not
    utilityService.getConfirmDialogAlert()
      .then((result) => {
        if (result.value) {
          let commentService = this.injector.get(CommentService);
          commentService.remove(this.comment._id).then((res)=>{
            this.remove.emit(index)
            utilityService.warningNotification('Comment Removed!');
          })
        }
      })
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

  onCommentLiked(data) {
    const userTmp = this.userData['first_name'] + ' ' + this.userData['last_name'];
    if (data == true) {
      this.likedByUsers.push(userTmp);
    } else {
      const index = this.likedByUsers.findIndex(user => user == userTmp);
      if (index >= 0) {
        this.likedByUsers.splice(index, 1);
      }
    }
  }

}

