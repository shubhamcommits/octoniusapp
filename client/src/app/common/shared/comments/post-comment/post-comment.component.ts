import { Component, EventEmitter, Input, OnInit, Output, Injector } from '@angular/core';
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
    created_date: moment().format()
  }

  // Remove Comment Event Emitter
  @Output('remove') remove = new EventEmitter();

  // Display Comment editor variable
  displayCommentEditor: boolean = true;

  // Quill Data
  quillData: any;

  _content_mentions: any;

  likedByUsers = [];
  topLikedByUsers = [];

  // Files Variable
  files: any = []

  // Cloud files
  cloudFiles: any = [];

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector,
    private utilityService: UtilityService,
    private commentService: CommentService
  ) { }

  async ngOnInit() {
    await this.commentService.getLikedByUsers(this.comment?._id).then(res => {
      this.likedByUsers = res['likedBy'];
    });
    
    await this.likedByUsers.slice(0, 10).forEach(user => {
      if(user._id) {
        this.topLikedByUsers.push((user['first_name'] || 'Deleted') + ' ' + (user['last_name'] || 'User'));
      } else {
        this.publicFunctions.getOtherUser(user).then(otherUser => {
          this.topLikedByUsers.push(otherUser['first_name'] + ' ' + otherUser['last_name']);
        }).catch(err => {
          this.topLikedByUsers.push($localize`:@@postActions.deletedUser:Deleted User`);
        });
      }
    });

    // if (this.comment && this.comment._liked_by) {
    //   await this.comment._liked_by.forEach(user => {
    //     (user['first_name'] && user['last_name'])
    //       ? this.likedByUsers.push(user['first_name'] || 'Deleted' + ' ' + user['last_name'] || 'User')
    //       : this.publicFunctions.getOtherUser(user._id || user).then(otherUser => {
    //           this.likedByUsers.push(otherUser['first_name'] + ' ' + otherUser['last_name']);
    //         }).catch(err => {
    //           this.likedByUsers.push($localize`:@@postComment.deletedUser:Deleted User`);
    //         });
    //   });
    // }

    this.displayCommentEditor = false;
  }

  /**
   * This function is responsible for feeding the quill data from current instance
   * @param quillData
   */
  getQuillData(quillData: any) {
    this.quillData = quillData;
  }

  saveCommentData() {
    if (this.quillData) {
      this.comment.content = JSON.stringify(this.quillData.contents)
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

      this.commentService.edit(formData, this.comment._id);
    }

    this.displayCommentEditor = false;
  }

  deleteComment(index: number) {

    // Ask User to delete the comment or not
    this.utilityService.getConfirmDialogAlert()
      .then((result) => {
        if (result.value) {
          this.commentService.remove(this.comment._id).then((res)=>{
            this.remove.emit(index)
            this.utilityService.warningNotification($localize`:@@postComment.commentRemoved:Comment Removed!`);
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

  async openLikedByDialog() {
    if (this.comment?.likes_count > 0) {
      let usersList = [];
      await this.commentService.getLikedByUsers(this.comment?._id).then(res => {
        usersList = res['likedBy'];
      });
      
      this.utilityService.openLikedByDialog(usersList);
    }
  }
}

