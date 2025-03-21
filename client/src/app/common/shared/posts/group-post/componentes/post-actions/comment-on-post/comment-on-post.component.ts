import { Component, OnInit, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-comment-on-post',
  templateUrl: './comment-on-post.component.html',
  styleUrls: ['./comment-on-post.component.scss']
})
export class CommentOnPostComponent implements OnInit {

  constructor() { }

  // Show Editor
  showEditor: boolean = false;

  // Emit the Show Comment Editor
  @Output('showCommentEditor') showCommentEditor = new EventEmitter()

  ngOnInit() {
  }

}
