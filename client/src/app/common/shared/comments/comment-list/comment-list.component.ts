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

  @ViewChild(MatPaginator) paginator: MatPaginator;

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  comments = [];
  commmentsToShow = [];

  constructor(
    private commentService: CommentService) {
  }

  ngOnInit() {

  }

  ngOnChanges() {
    // Start the loading spinner
    this.isLoading$.next(true);

    if (this.newComment) {
      this.length++;
      this.paginator.pageIndex = 0;
      this.comments.unshift(this.newComment);
      this.commmentsToShow =  this.comments.slice(0, this.paginator.pageSize);
    } else {
      this.commentService.getComments(this.postId).subscribe((res) => {
        this.comments = res['comments'];
        this.commmentsToShow =  this.comments.slice(0, this.paginator.pageSize);
      });
    }

    // Return the function via stopping the loader
    return this.isLoading$.next(false);
  }

  pageChangeEvent(event) {
    // Start the loading spinner
    this.isLoading$.next(true);

    this.commmentsToShow =  this.comments.slice(event.pageIndex * event.pageSize, event.pageIndex * event.pageSize + event.pageSize);

    // Return the function via stopping the loader
    return this.isLoading$.next(false);
  }

  removeComment(commentId: string) {
    // Start the loading spinner
    this.isLoading$.next(true);

    this.length--;
    const index = this.comments.findIndex(c => c._id == commentId);
    this.comments.splice(index, 1);
    this.commmentsToShow =  this.comments.slice(this.paginator.pageIndex * this.paginator.pageSize, this.paginator.pageIndex * this.paginator.pageSize + this.paginator.pageSize);

    // Return the function via stopping the loader
    return this.isLoading$.next(false);
  }
}
