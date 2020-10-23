import { Component, EventEmitter, Input, OnInit, Output, ViewChild, Injector } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { CommentService } from 'src/shared/services/comment-service/comment.service';
import { PublicFunctions } from 'modules/public.functions';

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

  _content_mentions: any;

  likedByUsers = [];

  async ngOnInit() {
    await this.comment._liked_by.forEach(user => {
      this.likedByUsers.push(user['first_name'] + ' ' + user['last_name']);
    });
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
    commentService.edit(this.comment._id, this.comment.content, this._content_mentions).then((res)=>{
      console.log(res);
    }).catch((err)=>{
      console.log(err);
    })
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
            console.log(res);
            this.remove.emit(index)
            utilityService.warningNotification('Comment Removed!');
          })
        }
      })
  }

}

