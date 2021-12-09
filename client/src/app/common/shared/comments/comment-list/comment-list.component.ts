import { Component, Input, Output, OnChanges, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CommentService } from 'src/shared/services/comment-service/comment.service';

@Component({
  selector: 'app-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.scss']
})
export class CommentListComponent implements OnChanges {

  @Input() postId;
  @Input() storyId;
  @Input() groupId;
  @Input() userData;
  @Input() length;
  @Input() newComment;

  @Output() removeCommentEvent = new EventEmitter();

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  comments = [];
  displayShowMore = false;

  constructor(
    private commentService: CommentService) {
  }

  ngOnInit() {
    // Start the loading spinner
    this.isLoading$.next(true);

    this.initComments();

    // Return the function via stopping the loader
    return this.isLoading$.next(false);
  }

  ngOnChanges() {
    // Start the loading spinner
    this.isLoading$.next(true);

    if (this.newComment) {
      this.comments.unshift(this.newComment);
      this.displayShowMore = this.comments.length > 5;
      this.length++;
      this.comments.splice(5);
      this.newComment = null;
    } else {
      this.initComments();
    }

    // Return the function via stopping the loader
    return this.isLoading$.next(false);
  }

  initComments() {
    this.comments = [];
    if (this.postId) {
      this.commentService.getComments(this.postId).subscribe((res) => {
        this.comments = res['comments'];
        this.displayShowMore = this.length > this.comments.length;
      });
    } else if (this.storyId) {
      this.commentService.getComments(null, this.storyId).subscribe((res) => {
        this.comments = res['comments'];
        this.displayShowMore = this.length > this.comments.length;
      });
    }
  }

  removeComment(commentId: string) {
    // Start the loading spinner
    this.isLoading$.next(true);

    const index = this.comments.findIndex(c => c._id == commentId);
    this.comments.splice(index, 1);
    this.length = this.length--;
    this.displayShowMore = this.length > 5;

    this.removeCommentEvent.emit(commentId);

    // Return the function via stopping the loader
    return this.isLoading$.next(false);
  }

  loadAllComments() {
    // Start the loading spinner
    this.isLoading$.next(true);
    if (this.postId) {
      this.commentService.getAllComments(this.postId).subscribe((res) => {
        this.comments = res['comments'];
        this.displayShowMore = false;
      });
    } else if (this.storyId) {
      this.commentService.getAllComments(null, this.storyId).subscribe((res) => {
        this.comments = res['comments'];
        this.displayShowMore = this.length > this.comments.length;
      });
    }

    // Return the function via stopping the loader
    return this.isLoading$.next(false);
  }
}
