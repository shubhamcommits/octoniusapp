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
  baseUrl = environment.UTILITIES_USERS_UPLOADS; 

  // Post Files baseURL
  fileBaseUrl = environment.UTILITIES_POSTS_UPLOADS;
  
  // Date Object for undefined dates
  date = Date.now()

  // Post as the Input from component
  @Input('post') post: any;

  // User Data Object
  @Input('userData') userData: any;

  @Input('globalFeed') isGlobal: boolean = false;

  // Delete Post Event Emitter
  @Output('delete') delete = new EventEmitter()

  // Task Status Event Emitter
  @Output('taskStatus') taskStatus = new EventEmitter();

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
    if (post.event._assigned_to!=null)
      return post.event._assigned_to.includes('all')
    else return false;
  }

  /**
   * This Function is responsible for changing the status on the UI
   * @param status 
   */
  changeTaskStatus(status: any){

    // Update the UI for the task status change
    this.post.task.status = status;

    // Emit the taskStatus to other components
    this.taskStatus.emit(status);
  }
}
