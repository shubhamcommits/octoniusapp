import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { BehaviorSubject } from 'rxjs';
import { CommentService } from 'src/shared/services/comment-service/comment.service';

@Component({
  selector: 'app-comment-list',
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.scss']
})
export class CommentListComponent implements OnInit, OnChanges {

  @Input() postId;
  @Input() groupId;
  @Input() userData;
  @Input() length;
  @Input() newComment;

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  comments = [];
  displayShowMore = false;

  constructor(
    private commentService: CommentService) {
  }

  ngOnInit() {
    this.commentService.getComments(this.postId).subscribe((res) => {
      this.comments = res['comments'];
      this.displayShowMore = this.length > this.comments.length;
    });
  }

  ngOnChanges() {
    // Start the loading spinner
    this.isLoading$.next(true);

    if (this.newComment) {
      this.comments.unshift(this.newComment);
      this.displayShowMore = this.comments.length > 5;
      this.length++;
      this.comments.splice(5);
    }

    // Return the function via stopping the loader
    return this.isLoading$.next(false);
  }

  removeComment(commentId: string) {
    // Start the loading spinner
    this.isLoading$.next(true);

    const index = this.comments.findIndex(c => c._id == commentId);
    this.comments.splice(index, 1);
    this.length = this.length--;
    this.displayShowMore = this.length > 5;

    // Return the function via stopping the loader
    return this.isLoading$.next(false);
  }

  loadAllComments() {
    // Start the loading spinner
    this.isLoading$.next(true);

    this.commentService.getAllComments(this.postId).subscribe((res) => {
      this.comments = res['comments'];
      this.displayShowMore = false;
    });

    // Return the function via stopping the loader
    return this.isLoading$.next(false);
  }
}
