import { Component, OnInit, Input, Injector, EventEmitter, Output } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PostService } from 'src/shared/services/post-service/post.service';
import { PublicFunctions } from 'modules/public.functions';
import { FlowService } from 'src/shared/services/flow-service/flow.service';
import moment from 'moment';

@Component({
  selector: 'app-new-task',
  templateUrl: './new-task.component.html',
  styleUrls: ['./new-task.component.scss']
})
export class NewTaskComponent implements OnInit {

  @Input('column') column: any;
  @Input('userData') userData: any;
  @Input('groupData') groupData: any;
  @Input() subtask: boolean;
  @Input() parentId: string;
  @Input() parentNS: boolean = false;
  @Input() isIdeaModuleAvailable;
  @Input() canEdit: boolean = true;

  // Post Event Emitter
  @Output('post') post = new EventEmitter()

  // Post Title Variable
  postTitle: any

  addSubTask = false;

  flows = [];

  saveAsNorthStar = false;
  saveAsIdea = false;
  saveAsCRMLead = false;
  saveAsCRMOrder = false;

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private flowService: FlowService,
    private utilityService: UtilityService,
    public injector: Injector
  ) { }

  ngOnInit() {
    if (this.subtask) {
      this.column = null;
    }

    if (this.utilityService.objectExists(this.groupData) && this.groupData?.type == 'crm') {
      this.changeTaskType(false, false, true, false);
    }

    if (this.groupData && this.groupData._id) {
      this.flowService.getGroupAutomationFlows(this.groupData._id).then(res => {
        this.flows = res['flows'];
      });
    }
  }

  /**
   * This function is responsible for enabling enter and espace function keys
   * @param $event
   * @param column
   */
  newTask(){
    this.createPost();
    if (this.subtask) {
      this.addSubTask = false;
    } else {
      this.column.addTask = false;
    }
  }

  changeTaskType(isNorthStar: boolean, isIdea: boolean, isCRMLead: boolean, isCRMOrder: boolean) {
    this.saveAsNorthStar = isNorthStar;
    this.saveAsIdea = isIdea;
    this.saveAsCRMLead = isCRMLead;
    this.saveAsCRMOrder = isCRMOrder;
  }

  /**
   * This function creates a new post in the activity
   */
  async createPost() {

    // Prepare Post Data
    var postData: any;
    const today = moment().format();

    if (this.subtask) {
      postData = {
        title: this.postTitle,
        content: '',
        type: 'task',
        _posted_by: this.userData._id,
        created_date: today,
        _group: this.groupData?._id || this.groupData,
        _content_mentions: [],
        _assigned_to: null,
        task: {
          status: 'to do',
          _column: null,
          custom_fields: [],
          _parent_task: this.parentId,
          isNorthStar: this.parentNS,
          northStar: (this.parentNS) ? {
              target_value: 0,
              values: [{
                date: Date.now(),
                value: 0,
                status: 'NOT STARTED',
                _user: this.userData?._id
              }],
              type: 'Currency',
              currency: 'USD'
            } : null,
          is_milestone: false,
          is_idea: false,
          is_crm_task: false
        }
      }
    } else {
      // Check if private group
      if (this.groupData?._id == this.userData?._private_group) {
        postData = {
          title: this.postTitle,
          content: '',
          type: 'task',
          _posted_by: this.userData._id,
          created_date: today,
          _group: this.groupData._id,
          _content_mentions: [],
          _assigned_to: this.userData._id,
          task: {
            status: 'to do',
            custom_fields: [],
            _column: this.column._id,
            isNorthStar: this.saveAsNorthStar,
            northStar: (this.saveAsNorthStar) ? {
                target_value: 0,
                values: [{
                  date: Date.now(),
                  value: 0,
                  status: 'NOT STARTED',
                  _user: this.userData?._id
                }],
                type: 'Currency',
                currency: 'USD'
              } : null,
            is_milestone: false,
            is_idea: this.saveAsIdea,
            is_crm_task: this.saveAsCRMLead,
            is_crm_order: this.saveAsCRMOrder
          }
        }
      }
      else {
        postData = {
          title: this.postTitle,
          content: '',
          type: 'task',
          _posted_by: this.userData._id,
          created_date: today,
          _group: this.groupData._id,
          _content_mentions: [],
          _assigned_to: null,
          task: {
            status: 'to do',
            custom_fields: [],
            _column: this.column._id,
            isNorthStar: this.saveAsNorthStar,
            northStar: (this.saveAsNorthStar) ? {
                target_value: 0,
                values: [{
                  date: Date.now(),
                  value: 0,
                  status: 'NOT STARTED',
                  _user: this.userData?._id
                }],
                type: 'Currency',
                currency: 'USD'
              } : null,
            is_milestone: false,
            is_idea: this.saveAsIdea,
            is_crm_task: this.saveAsCRMLead,
            is_crm_order: this.saveAsCRMOrder
          }
        }
      }
    }
    
    const isShuttleAvailable: boolean = await this.publicFunctions.isShuttleTasksModuleAvailable();
    const isIndividualSubscription: boolean = await this.publicFunctions.checkIsIndividualSubscription();

    // Create FormData Object
    let formData = new FormData();
    // Append Post Data
    formData.append('post', JSON.stringify(postData))
    formData.append('isShuttleTasksModuleAvailable', isShuttleAvailable.toString() || 'false');
    formData.append('isIndividualSubscription', isIndividualSubscription.toString() || 'false');

    // Call the Helper Function
    this.onCreatePost(formData, this.post)

    // Clear the postTitle
    this.postTitle = undefined;
    this.saveAsNorthStar = false;
    this.saveAsIdea = false;
    this.saveAsCRMLead = false;
    this.saveAsCRMOrder = false;
  }

  /**
   * This function is responsible for calling add post service functions
   * @param postData
   */
  onCreatePost(postData: FormData, post: EventEmitter<any>) {

    // Create Utility Service Instance
    let utilityService = this.injector.get(UtilityService)
    let postService = this.injector.get(PostService)

    // Asynchronously call the utility service
    utilityService.asyncNotification($localize`:@@newTask.pleaseWaitCreatingPost:Please wait we are creating the post...`, new Promise((resolve, reject) => {
      postService.create((this.groupData?._workspace?._id || this.groupData?._workspace), postData)
        .then(async (res) => {
          let postData = res['post'];

          if (postData.type === 'task') {
            postData = await this.publicFunctions.executedAutomationFlowsPropertiesFront(this.flows, postData, this.groupData?._id, true);
          }

          // Emit the Post to the other compoentns
          post.emit(postData);

          // Resolve with success
          resolve(utilityService.resolveAsyncPromise($localize`:@@newTask.taskCreated:Task Created!`))
        })
        .catch((err) => {
          utilityService.clearAllNotifications();
          if (err.status === 0) {
            reject(utilityService.errorNotification($localize`:@@newTask.connectionError:Sorry, we are having a hard time connecting to the server. You have a poor connection. The task can't be created.`));
          } else {
            reject(utilityService.rejectAsyncPromise($localize`:@@newTask.unableCreateNewTask:Unable to create new task, please try again!`));
          }
        })
    }))
  }
}
