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

  ngOnInit() {
  }

  /**
   * This function emits the delete post to the parent components
   */
  deletePost(post: any){
    this.delete.emit(post);
  }

}
