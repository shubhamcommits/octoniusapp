import { Component, OnInit, Input, Output, EventEmitter, Injector } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { environment } from 'src/environments/environment';
import { FlowService } from 'src/shared/services/flow-service/flow.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-post-view',
  templateUrl: './post-view.component.html',
  styleUrls: ['./post-view.component.scss']
})
export class PostViewComponent implements OnInit {

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

  // Group Data Object
  @Input() groupData: any;

  // Delete Post Event Emitter
  @Output('delete') delete = new EventEmitter()

  // Task Status Event Emitter
  @Output('taskStatus') taskStatus = new EventEmitter();

  // Fullscreen modal closed
  @Output() closeModalEvent = new EventEmitter();

  @Output() pinEvent = new EventEmitter();

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  flows = [];

  authToken: string;

  constructor(
    private injector: Injector,
    private flowService: FlowService,
    public utilityService: UtilityService,
    public dialog: MatDialog,
    public storageService: StorageService
  ) { }

  ngOnInit() {
    this.flowService.getGroupAutomationFlows((this.post._group._id || this.post._group)).then(res => {
      if (res) {
        this.flows = res['flows'];
      }
    });

    this.authToken = `Bearer ${this.storageService.getLocalData('authToken')['token']}`
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
    if (post._assigned_to!=null)
      return post._assigned_to.includes('all')
    else return false;
  }

  /**
   * This Function is responsible for changing the status on the UI
   * @param status
   */
  async changeTaskStatus(status: any){

    // Update the UI for the task status change
    this.post.task.status = status;

    this.post = await this.publicFunctions.executedAutomationFlowsPropertiesFront(this.flows, this.post);

    // Emit the taskStatus to other components
    this.taskStatus.emit(status);
  }

  /**
   * This function is responsible for opening a fullscreen dialog to see the member profile
   */
  openFullscreenModal(userId: string): void {
    this.utilityService.openFullscreenModal(userId);
  }

  onPostPin(pin: any) {
    this.post.pin_to_top = pin;
    this.pinEvent.emit({pin: pin, _id: this.post._id});
  }
}
