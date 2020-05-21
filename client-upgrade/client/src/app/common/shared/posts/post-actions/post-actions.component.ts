import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-post-actions',
  templateUrl: './post-actions.component.html',
  styleUrls: ['./post-actions.component.scss']
})
export class PostActionsComponent implements OnInit {

  constructor() { }

  // Post Input
  @Input('post') post: any;

  // User Data Object
  @Input('userData') userData: any;

  // Delete Post Event Emitter
  @Output('delete') delete = new EventEmitter()

  // Show Comment State
  showComments: boolean = false;

  // Show Comment Editor Variable
  showCommentQuillEditor = false;

  // Comments Array
  comments: any = []

  // Show Comment Editor
  @Output('showCommentEditor') showCommentEditorEmitter = new EventEmitter()

  // Comments
  @Output('comments') showCommentsEmitter = new EventEmitter()

  ngOnInit() {
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
    this.showCommentQuillEditor = !this.showCommentQuillEditor
  }

  /**
   * Fetch Comments
   */
  fetchComments() {
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
    this.comments.unshift(comment)
    this.post.comments = this.comments
    console.log(this.comments);
  }

  removeComment(index: number){
    this.comments.splice(index, 1);
  }

}
