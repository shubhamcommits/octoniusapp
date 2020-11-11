import { Component, OnInit, Input, Output, EventEmitter, Injector } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { environment } from 'src/environments/environment';
import { FlowService } from 'src/shared/services/flow-service/flow.service';

@Component({
  selector: 'app-post-view',
  templateUrl: './post-view.component.html',
  styleUrls: ['./post-view.component.scss']
})
export class PostViewComponent implements OnInit {

  constructor(
    private injector: Injector,
    private flowService: FlowService) { }

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

  // Fullscreen modal closed
  @Output() closeModalEvent = new EventEmitter();

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  flows = [];

  ngOnInit() {
    this.flowService.getGroupAutomationFlows((this.post._group._id || this.post._group)).then(res => {
      this.flows = res['flows'];
    });
  }

  /**
   * This function emits the delete post to the parent components
   */
  deletePost(post: any){
    this.delete.emit(post);
  }

  postModalCloseEvent(post: any) {
    this.post = post;
    this.closeModalEvent.emit(post);
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
  async changeTaskStatus(status: any){

    // Update the UI for the task status change
    this.post.task.status = status;

    let dataFlows = {
      moveTo: '',
      assignTo: ''
    };

    dataFlows = await this.publicFunctions.getExecutedAutomationFlowsProperties(this.post, status, this.flows, dataFlows);

    if (dataFlows.moveTo) {
      this.post.task._column.title = dataFlows.moveTo;
    }

    if (dataFlows.assignTo) {
      this.post.task.unassigned = false;
      this.post.task._assigned_to = await this.publicFunctions.getOtherUser(dataFlows.assignTo);
    }

    // Emit the taskStatus to other components
    this.taskStatus.emit(status);
  }
}
