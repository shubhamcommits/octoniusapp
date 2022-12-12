import { Component, OnInit, Input, Output, EventEmitter, Injector } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { PostService } from 'src/shared/services/post-service/post.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-post-actions',
  templateUrl: './post-actions.component.html',
  styleUrls: ['./post-actions.component.scss']
})
export class PostActionsComponent implements OnInit {

  @Input('post') post: any;
  @Input('userData') userData: any;
  @Input() fullscreen: boolean = false;
  @Input() groupData: any;
  @Input() canEdit = true;
  @Input() isIdeaModuleAvailable;

  @Output('delete') delete = new EventEmitter()
  @Output() pinEvent = new EventEmitter();
  @Output('showCommentEditor') showCommentEditorEmitter = new EventEmitter()
  @Output('comments') showCommentsEmitter = new EventEmitter();
  @Output() newCommentEmitter = new EventEmitter();
  @Output() closeModalEvent = new EventEmitter();

  // Show Comment State
  showComments: boolean = false;

  // Show Comment Editor Variable
  showCommentQuillEditor = false;

  likedByUsers = [];
  topLikedByUsers = [];
  
  followedByUsers = [];
  newComment;

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector,
    private utilityService: UtilityService,
    private postService: PostService
  ) { }

  async ngOnInit() {

    await this.postService.getLikedByUsers(this.post?._id).then(res => {
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

    await this.post._followers.forEach(user => {
      (user['first_name'] && user['last_name'])
        ? this.followedByUsers.push((user['first_name'] || 'Deleted') + ' ' + (user['last_name'] || 'User'))
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
    this.showCommentQuillEditor = !this.showCommentQuillEditor
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

  async openLikedByDialog() {
    if (this.likedByUsers?.length > 0) {
      this.utilityService.openLikedByDialog(this.likedByUsers);
    }
  }
}
