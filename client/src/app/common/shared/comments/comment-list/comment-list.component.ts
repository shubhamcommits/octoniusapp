import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
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

  comments = [];
  lastComment;
  currentPage = 0;

  commmentsToShow;

  constructor(
    private commentService: CommentService) {
  }

  ngOnInit() {

  }

  ngOnChanges() {
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
  }

  pageChangeEvent(event) {
    this.commmentsToShow =  this.comments.slice(event.pageIndex * event.pageSize, event.pageIndex * event.pageSize + event.pageSize);
  }

  removeComment(commentId: string) {
    this.length--;
    const index = this.comments.findIndex(c => c._id == commentId);
    this.comments.splice(index, 1);
    this.commmentsToShow =  this.comments.slice(this.paginator.pageIndex * this.paginator.pageSize, this.paginator.pageIndex * this.paginator.pageSize + this.paginator.pageSize);
  }
}
