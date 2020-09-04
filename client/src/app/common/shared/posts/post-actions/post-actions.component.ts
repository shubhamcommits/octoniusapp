import { Component, OnInit, Input, Output, EventEmitter, Injector } from '@angular/core';
import { CommentService } from 'src/shared/services/comment-service/comment.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PublicFunctions } from 'src/app/dashboard/public.functions';

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

  // Delete Post Event Emitter
  @Output('delete') delete = new EventEmitter()

  // Show Comment State
  showComments: boolean = false;

  // Show Comment Editor Variable
  showCommentQuillEditor = false;

  // Comments Array
  comments: any = [];

  likedByUsers = [];
  followedByUsers = [];

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  // Show Comment Editor
  @Output('showCommentEditor') showCommentEditorEmitter = new EventEmitter()

  // Comments
  @Output('comments') showCommentsEmitter = new EventEmitter();

  @Output() newCommentEmitter = new EventEmitter();

  @Output() closeModalEvent = new EventEmitter();

  async ngOnInit() {
    await this.post._liked_by.forEach(userId => {
      this.publicFunctions.getOtherUser(userId).then(user => {
        this.likedByUsers.push(user['first_name'] + ' ' + user['last_name']);
      });
    });

    await this.post._followers.forEach(user => {
      this.followedByUsers.push(user['first_name'] + ' ' + user['last_name']);
    });
    this.fetchComments();
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

  /**
   * Fetch Comments
   */
  fetchComments() {
    if (this.showComments==false){
      this.commentService.getComments(this.post._id).subscribe((res)=>{
        this.comments = res.comments;
        this.post.comments = res.comments;
      });
    }
    if (this.post.comments.length > 0){
      this.showComments = !this.showComments
    }
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

  newComment(comment: any) {
    this.comments.unshift(comment);
    this.post.comments = this.comments;
    console.log(this.post.comments.length);
    this.newCommentEmitter.emit(comment);
  }

  removeComment(index: number){
    this.comments.splice(index, 1);
  }

  postModalCloseEvent(post) {
    this.post = post;
    this.closeModalEvent.emit(post);
  }
}
