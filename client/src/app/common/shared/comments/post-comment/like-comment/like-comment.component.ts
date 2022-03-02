import { Component, OnChanges, Input, Injector, EventEmitter, Output } from '@angular/core';
import { CommentService } from 'src/shared/services/comment-service/comment.service';

@Component({
  selector: 'app-like-comment',
  templateUrl: './like-comment.component.html',
  styleUrls: ['./like-comment.component.scss']
})
export class LikeCommentComponent implements OnChanges {


  // comment Data
  @Input('comment') comment: any;

  // User Data Variable
  @Input('userData') userData: any;

  @Output() commentLikedEmiter = new EventEmitter();

  liked = false;

  constructor(
    private _Injector: Injector
  ) { }

  ngOnChanges() {
    this.isLikedByUser();
  }

  /**
   * Like the comment
   */
  likeComment() {

    // Add the userId to the comment._liked_by array
    this.comment._liked_by.push(this.userData._id)

    // Increment the likes count by 1
    this.comment.likes_count += 1

    this.isLikedByUser();
    this.commentLikedEmiter.emit(true);

    // Call the Service Function to like a comment
    // this.onLikeComment(this.comment._id);
    this.onLikeComment();
  }

  /**
   * This function is responsible for calling the HTTP request to like a comment
   */
  onLikeComment() {

    // comment Service Instance
    let commentService = this._Injector.get(CommentService)

    // Return a new promise to call the service function
    return new Promise((resolve, reject) => {
      commentService.like(this.comment._id)
        .then((res) => {
          resolve({});
        })
        .catch((err) => {
          reject()
        })
    })
  }

  /**
   * Unlike the comment
   */
  unlikeComment() {

    // Find the index of where the userId is located
    let userIndex = this.comment._liked_by.findIndex((userId: any) => userId === this.userData._id)

    // Remove the userId from the array
    this.comment._liked_by.splice(userIndex, 1)

    // Decrement the likes count by 1
    this.comment.likes_count -= 1

    this.isLikedByUser();
    this.commentLikedEmiter.emit(false);

    // Call the Service Function to unlike a comment
    this.onUnlikeComment(this.comment._id);
  }

  /**
   * This function is responsible for calling the HTTP request to unlike a comment
   * @param commentId
   */
  onUnlikeComment(commentId: string) {

    // comment Service Instance
    let commentService = this._Injector.get(CommentService)

    // Return a new promise to call the service function
    return new Promise((resolve, reject) => {
      commentService.unlike(commentId)
        .then((res) => {
          resolve(res);
        })
        .catch((err) => {
          reject()
        })
    })
  }

  /**
   * Check if the comment is liked by the currently loggedIn user
   */
  isLikedByUser() {
    const index = this.comment._liked_by.findIndex(user => (user._id || user) == this.userData?._id);
    if (index >= 0) {
      this.liked = true;
    } else {
      this.liked = false;
    }
  }

}
