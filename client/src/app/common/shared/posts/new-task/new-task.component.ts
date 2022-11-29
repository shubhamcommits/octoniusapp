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

  constructor(
    private flowService: FlowService,
    public injector: Injector
  ) { }

  // Column as the Input object
  @Input('column') column: any;

  // User Data Object
  @Input('userData') userData: any;

  // Group Data Object
  @Input('groupData') groupData: any;

  @Input() subtask: boolean;
  @Input() parentId: string;
  @Input() parentNS: boolean = false;

  @Input() isIdeaModuleAvailable;

  // Post Event Emitter
  @Output('post') post = new EventEmitter()

  // Post Title Variable
  postTitle: any

  addSubTask = false;

  flows = [];

  saveAsNorthStar = false;
  saveAsIdea = false;

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  ngOnInit() {
    if (this.subtask) {
      this.column = null;
    }

    if (this.groupData) {
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

  changeTaskType(isNorthStar: boolean, isIdea: boolean) {
    this.saveAsNorthStar = isNorthStar;
    this.saveAsIdea = isIdea;
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
        task: {
          _assigned_to: null,
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
                status: 'NOT STARTED'
              }],
              type: 'Currency',
              currency: 'USD'
            } : null,
          is_milestone: false,
          is_idea: false
        }
      }
    } else {
      // Check if private group
      if (this.groupData._id == this.userData._private_group) {
        postData = {
          title: this.postTitle,
          content: '',
          type: 'task',
          _posted_by: this.userData._id,
          created_date: today,
          _group: this.groupData._id,
          _content_mentions: [],
          task: {
            _assigned_to: this.userData._id,
            status: 'to do',
            custom_fields: [],
            _column: this.column._id,
            isNorthStar: this.saveAsNorthStar,
            northStar: (this.saveAsNorthStar) ? {
                target_value: 0,
                values: [{
                  date: Date.now(),
                  value: 0,
                  status: 'NOT STARTED'
                }],
                type: 'Currency',
                currency: 'USD'
              } : null,
            is_milestone: false,
            is_idea: this.saveAsIdea
          }
        }
      }
      else{
        postData = {
          title: this.postTitle,
          content: '',
          type: 'task',
          _posted_by: this.userData._id,
          created_date: today,
          _group: this.groupData._id,
          _content_mentions: [],
          task: {
            _assigned_to: null,
            status: 'to do',
            custom_fields: [],
            _column: this.column._id,
            isNorthStar: this.saveAsNorthStar,
            northStar: (this.saveAsNorthStar) ? {
                target_value: 0,
                values: [{
                  date: Date.now(),
                  value: 0,
                  status: 'NOT STARTED'
                }],
                type: 'Currency',
                currency: 'USD'
              } : null,
            is_milestone: false,
            is_idea: this.saveAsIdea
          }
        }
      }
    }

    // Create FormData Object
    let formData = new FormData();

    // Append Post Data
    formData.append('post', JSON.stringify(postData))
    formData.append('isShuttleTasksModuleAvailable', (await this.publicFunctions.isShuttleTasksModuleAvailable()).toString());

    // Call the Helper Function
    this.onCreatePost(formData, this.post)

    // Clear the postTitle
    this.postTitle = undefined;
    this.saveAsNorthStar = false;
    this.saveAsIdea = false;

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
      postService.create(postData)
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

          // Catch the error and reject the promise
          reject(utilityService.rejectAsyncPromise($localize`:@@newTask.unableCreateNewTask:Unable to create new task, please try again!`))
        })
    }))
  }
}
