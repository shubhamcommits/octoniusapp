import { Component, OnInit, Input, Output, EventEmitter, Injector, OnChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';
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
export class PostViewComponent implements OnInit, OnChanges {
  
  @Input('post') post: any;
  @Input('userData') userData: any;
  @Input('globalFeed') isGlobal: boolean = false;
  @Input() groupData: any;
  @Input() workspaceId: string;

  @Output('delete') delete = new EventEmitter()
  @Output('taskStatus') taskStatus = new EventEmitter();
  @Output() closeModalEvent = new EventEmitter();
  @Output() pinEvent = new EventEmitter();
  
  flows = [];
  
  authToken: string;
  
  showFullContent = false;
  postContent = ''
  
  // Post Files baseURL
  fileBaseUrl = environment.UTILITIES_POSTS_UPLOADS;
  
  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

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

  async ngOnChanges() {
    if (this.post.content) {
      // Initiate the converter
      // let converter = new QuillDeltaToHtmlConverter(JSON.parse(this.post.content)['ops'], {});
      // if (converter) {
      //   converter.renderCustomWith((customOp) => {
      //     // Conditionally renders blot of mention type
      //     if(customOp.insert.type === 'mention'){
      //       // Get Mention Blot Data
      //       const mention = customOp.insert.value;

      //       // Template Return Data
      //       return (
      //         `<span
      //           class="mention"
      //           data-index="${mention.index}"
      //           data-denotation-char="${mention.denotationChar}"
      //           data-link="${mention.link}"
      //           data-value='${mention.value}'>
      //           <span contenteditable="false">
      //             ${mention.value}
      //           </span>
      //         </span>`
      //       )
      //     }
      //   });
      //   // Convert into html
      //   this.postContent = converter.convert();
      // }
      this.postContent = await this.publicFunctions.convertQuillToHTMLContent(JSON.parse(this.post?.content)['ops']);
    }

    if (this.postContent.length > 250) {
      this.postContent = this.postContent.substring(0, 250) + '...';
      this.showFullContent = false;
    } else {
      this.showFullContent = true;
    }
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

    this.post = await this.publicFunctions.executedAutomationFlowsPropertiesFront(this.flows, this.post, this.groupData?._id);

    // Emit the taskStatus to other components
    this.taskStatus.emit(status);
  }

  /**
   * This function is responsible for opening a fullscreen dialog to see the member profile
   */
  openMeberBusinessCard(userId: string): void {
    this.utilityService.openMeberBusinessCard(userId);
  }

  onPostPin(pin: any) {
    this.post.pin_to_top = pin;
    this.pinEvent.emit({pin: pin, _id: this.post._id});
  }

  showHideFullContent() {
    this.showFullContent = !this.showFullContent;
  }
}
