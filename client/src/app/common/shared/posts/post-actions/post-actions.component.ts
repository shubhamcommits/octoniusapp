import { Component, OnInit, Input, Output, EventEmitter, Injector } from '@angular/core';
import { CommentService } from 'src/shared/services/comment-service/comment.service';
import { PublicFunctions } from 'modules/public.functions';

@Component({
  selector: 'app-post-actions',
  templateUrl: './post-actions.component.html',
  styleUrls: ['./post-actions.component.scss']
})
export class PostActionsComponent implements OnInit {

  constructor(
    private commentService: CommentService,
    private injector: Injector
  ) { }

  // Post Input
  @Input('post') post: any;

  // User Data Object
  @Input('userData') userData: any;

  @Input() fullscreen: boolean = false;

  @Input() groupData: any;
  @Input() isIdeaModuleAvailable;

  // Delete Post Event Emitter
  @Output('delete') delete = new EventEmitter()

  @Output() pinEvent = new EventEmitter();

  // Show Comment State
  showComments: boolean = false;

  // Show Comment Editor Variable
  showCommentQuillEditor = false;

  likedByUsers = [];
  likedByUsersStr = '';
  followedByUsers = [];
  followedByUsersStr = '';
  newComment;

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  // Show Comment Editor
  @Output('showCommentEditor') showCommentEditorEmitter = new EventEmitter()

  // Comments
  @Output('comments') showCommentsEmitter = new EventEmitter();

  @Output() newCommentEmitter = new EventEmitter();

  @Output() closeModalEvent = new EventEmitter();

  async ngOnInit() {
    await this.post._liked_by.forEach(user => {
      if(user._id) {
        this.likedByUsers.push(user['first_name'] || 'Deleted' + ' ' + user['last_name'] || 'User');
      } else {
        this.publicFunctions.getOtherUser(user).then(otherUser => {
          this.likedByUsers.push(otherUser['first_name'] + ' ' + otherUser['last_name']);
        }).catch(err => {
          this.likedByUsers.push($localize`:@@postActions.deletedUser:Deleted User`);
        });
      }
    });

    await this.post._followers.forEach(user => {
      (user['first_name'] && user['last_name'])
        ? this.followedByUsers.push(user['first_name'] || 'Deleted' + ' ' + user['last_name'] || 'User')
        : this.publicFunctions.getOtherUser(user._id || user).then(otherUser => {
            this.followedByUsers.push(otherUser['first_name'] + ' ' + otherUser['last_name']);
          }).catch(err => {
            this.followedByUsers.push($localize`:@@postActions.deletedUser:Deleted User`);
          });
    });

    this.showComments = false;
  }

  onPostLikedEmitter(userId) {
    this.publicFunctions.getOtherUser(userId).then(user => {
      this.likedByUsers.push(user['first_name'] + ' ' + user['last_name']);
    });
  }

  onPostUnLikedEmitter(user) {
    const index = this.likedByUsers.findIndex((username: string) => username.toLowerCase() === (user.first_name + ' ' + user.last_name).toLowerCase())
    this.likedByUsers.splice(index, 1);
  }

  onPostFollowEmitter(userId) {
    this.publicFunctions.getOtherUser(userId).then(user => {
      this.followedByUsers.push(user['first_name'] + ' ' + user['last_name']);
    });
  }

  onPostUnFollowEmitter(user) {
    const index = this.likedByUsers.findIndex((username: string) => username.toLowerCase() === (user.first_name + ' ' + user.last_name).toLowerCase())
    this.followedByUsers.splice(index, 1);
  }

  /**
   * This function emits the delete post to the parent components
   */
  deletePost(post: any) {
    this.delete.emit(post);
  }

  /**
   * Show the comment Editor State
   * @param emiterState
   */
  showCommentEditor(emiterState: boolean) {
    this.showCommentQuillEditor = !this.showCommentQuillEditor;
  }

  hideCommentEditor(emiterState: string) {
    this.showCommentQuillEditor = !this.showCommentQuillEditor
  }

  /**
   * This function is responsible for showing the comments
   * @param comments
   */
  displayComments(commentsDisplayState: boolean) {
    this.showComments = commentsDisplayState
  }

  newCommentReceived(comment: any) {
    this.post.comments_count++;
    this.newComment = comment;
    this.newCommentEmitter.emit(comment);
  }

  postModalCloseEvent(post) {
    this.post = post;
    this.closeModalEvent.emit(post);
  }

  onCommentRemoved($event) {
    this.post.comments_count--;
  }

  onPostPin(pin: any) {
    this.pinEvent.emit(pin);
  }
}
