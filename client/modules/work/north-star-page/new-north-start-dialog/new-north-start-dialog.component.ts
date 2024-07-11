import { Component, EventEmitter, Inject, Injector, OnInit, Output } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';
import { FlowService } from 'src/shared/services/flow-service/flow.service';
import { ManagementPortalService } from 'src/shared/services/management-portal-service/management-portal.service';
import { PostService } from 'src/shared/services/post-service/post.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-new-north-start-dialog',
  templateUrl: './new-north-start-dialog.component.html',
  styleUrls: ['./new-north-start-dialog.component.scss']
})
export class NewNorthStarDialogComponent implements OnInit {

  @Output() nsCreatedEvent = new EventEmitter();

  userId;
  workspaceData;
  userGroups = [];
  groupSections: any = [];

  _parent_task = '';

  postTitle: string = '';
  groupId;
  sectionId;

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private postService: PostService,
    private flowService: FlowService,
    private utilityService: UtilityService,
    private managementPortalService: ManagementPortalService,
    public injector: Injector,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mdDialogRef: MatDialogRef<NewNorthStarDialogComponent>
  ) {
    this.userId = this.data.userId;
    this._parent_task = this.data._parent_task;
  }

  async ngOnInit() {
    this.publicFunctions.getAllUserGroups(this.userId)// using the userId because it is not needed in the endpoint.
      .then(async (groups: any) => {
        this.userGroups = groups.sort((g1, g2) => (g1.group_name.toLowerCase() > g2.group_name.toLowerCase()) ? 1 : -1);
      });
  }

  async changeGroup() {
    this.groupSections = await this.publicFunctions.getAllColumns(this.groupId);
  }

  /**
   * This function creates a new NS
   */
  async createNS() {

    if (this.postTitle &&  this.postTitle != '') {
      // Prepare Post Data
      let postData: any;
      const today = moment().format();

      postData = {
        title: this.postTitle,
        content: '',
        type: 'task',
        _posted_by: this.userId,
        created_date: today,
        // _group: this.groupId,
        _content_mentions: [],
        task: {
          _assigned_to: null,
          status: 'to do',
          custom_fields: [],
          // _column: this.sectionId,
          isNorthStar: true,
          _parent_task: this._parent_task,
          northStar: {
              target_value: 0,
              values: [{
                date: Date.now(),
                value: 0,
                status: 'NOT STARTED',
                _user: this.userId
              }],
              type: 'Currency',
              currency: 'USD'
            },
          is_milestone: false,
          is_idea: false
        }
      }

      // Create FormData Object
      let formData = new FormData();

      // Append Post Data
      formData.append('post', JSON.stringify(postData))
      formData.append('isShuttleTasksModuleAvailable', (await this.publicFunctions.isShuttleTasksModuleAvailable()).toString());
      formData.append('isIndividualSubscription', (await this.publicFunctions.checkIsIndividualSubscription()).toString());

      // Call the Helper Function
      this.utilityService.asyncNotification($localize`:@@newNorthStarDialog.pleaseWaitCreatingPost:Please wait we are creating the task...`, new Promise((resolve, reject) => {
        this.workspaceData = this.publicFunctions.getCurrentWorkspace();
        this.postService.create(this.workspaceData?._id, formData)
          .then(async (res) => {
            postData = res['post'];

            if (postData.type === 'task' && postData?._group) {
              let flows = [];
              this.flowService.getGroupAutomationFlows(this.groupId).then(res => {
                flows = res['flows'];
              });
              postData = await this.publicFunctions.executedAutomationFlowsPropertiesFront(flows, postData, this.groupId, true);
            }

            this.nsCreatedEvent.emit(postData);
            this.closeDialog();

            // Resolve with success
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@newNorthStarDialog.taskCreated:Task Created!`))
          })
          .catch((err) => {
            this.utilityService.clearAllNotifications();
            if (err.status === 0) {
              reject(this.utilityService.errorNotification($localize`:@@newNorthStarDialog.connectionError:Sorry, we are having a hard time connecting to the server. You have a poor connection. The NS can't be created.`));
            } else {
              reject(this.utilityService.rejectAsyncPromise($localize`:@@newNorthStarDialog.unableToCreatePost:Unable to create NS, please try again!`))
            }
          })
      }))

      // Clear the postTitle
      this.postTitle = undefined;
    }
  }

  closeDialog() {
    // Close the modal
    this.mdDialogRef.close();
  }
}
