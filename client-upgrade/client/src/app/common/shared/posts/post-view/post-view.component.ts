import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-post-view',
  templateUrl: './post-view.component.html',
  styleUrls: ['./post-view.component.scss']
})
export class PostViewComponent implements OnInit {

  constructor() { }

  // Base Url for uploads
  baseUrl = environment.UTILITIES_BASE_URL 
  
  // Date Object for undefined dates
  date = Date.now()

  // Post as the Input from component
  @Input('post') post: any;

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

  /**
   * This function checks if an event is assigned to all the members of the group
   * @param post 
   */
  eventAssignedToAll(post: any){
    return post.event._assigned_to.includes('all')
  }

}
