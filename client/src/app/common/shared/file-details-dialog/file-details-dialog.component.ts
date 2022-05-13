import { Component, OnInit, EventEmitter, Output, Inject, Injector } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { GroupService } from 'src/shared/services/group-service/group.service';
import moment from 'moment';
// ShareDB Client
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FilesService } from 'src/shared/services/files-service/files.service';

@Component({
  selector: 'app-file-details-dialog',
  templateUrl: './file-details-dialog.component.html',
  styleUrls: ['./file-details-dialog.component.scss']
})
export class FileDetailsDialogComponent implements OnInit {

  // Close Event Emitter - Emits when closing dialog
  @Output() closeEvent = new EventEmitter();
  @Output() deleteEvent = new EventEmitter();
  @Output() allVersionsDeletedEmitter = new EventEmitter();

  fileData: any;
  userData: any;
  groupData: any;

  customFields = [];
  selectedCFValues = [];

  // Title of the File
  original_name: string = '';

  // Quill Data Object
  quillData: any;
  canEdit: boolean = true;
  canView: boolean = true;

  // Content Mentions Variables keeps a track of mentioned members
  _content_mentions: any = [];

  // Tags Object
  tags: any = [];

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  // Variable to enable or disable save button
  contentChanged = false;

  // Files Variable
  files: any = [];

  // Cloud files
  cloudFiles: any = [];

  // Comments Array
  comments: any = [];

  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  newComment;

  constructor(
    private filesService: FilesService,
    private groupService: GroupService,
    private utilityService: UtilityService,
    private injector: Injector,
    private router: ActivatedRoute,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mdDialogRef: MatDialogRef<FileDetailsDialogComponent>
    ) {}

  async ngOnInit() {
    // Start the loading spinner
    this.isLoading$.next(true);
    this.fileData = this.data.fileData;
    this.userData = this.data.userData;
    this.groupData = this.data.groupData;

    if (!this.groupData) {
      this.groupData = await this.publicFunctions.getCurrentGroupDetails();
    }

    await this.initFileData();

    this.canEdit = await this.utilityService.canUserDoFileAction(this.fileData, this.groupData, this.userData, 'edit');

    if (!this.canEdit) {
      const hide = await this.utilityService.canUserDoFileAction(this.fileData, this.groupData, this.userData, 'hide');
      this.canView = await this.utilityService.canUserDoFileAction(this.fileData, this.groupData, this.userData, 'view') || !hide;
    } else {
      this.canView = true;
    }

    // Return the function via stopping the loader
    return this.isLoading$.next(false);
  }

  formateCFDate(date){
    return moment(moment.utc(date), "YYYY-MM-DD").toDate();
  }

  async initFileData() {
    // Set the title of the file
    this.original_name = this.fileData.original_name;

    // Set the due date to be undefined
    this.tags = [];

    this.customFields = [];
    this.selectedCFValues = [];
    this.groupService.getGroupFilesCustomFields(this.groupData?._id).then((res) => {
      if (res['group']['files_custom_fields']) {
        res['group']['files_custom_fields'].forEach(field => {
          this.customFields.push(field);

          if (!this.fileData.custom_fields) {
            this.fileData.custom_fields = new Map<string, string>();
          }

          if (!this.fileData.custom_fields[field.name]) {
            this.fileData.custom_fields[field.name] = '';
            this.selectedCFValues[field.name] = '';
          } else {
            this.selectedCFValues[field.name] = this.fileData.custom_fields[field.name];
          }
        });
      }
    });

    this.tags = this.fileData.tags;
  }

  /**
   * This function is mapped with the event change of @variable - title
   * Show update detail option if title has been changed
   * @param event - new title value
   */
  async titleChange(event: any) {
    const newTitle = event.target.value;
    if (newTitle !== this.original_name) {
      this.original_name = newTitle;
      await this.updateDetails();
    }
  }

  quillContentChanged(event: any) {
    this.contentChanged = true;
    this.quillData = event;
  }

  /**
   * This function receives the output from the tags components
   * @param tags
   */
  getTags(tags: any) {

    // Set the tags value
    this.tags = tags;

    this.updateDetails();
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return !(JSON.stringify(object) === JSON.stringify({}))
  }

  onCloseDialog() {
    this.closeEvent.emit(this.fileData);
  }

  newCommentAdded(comment) {
    // this.comments.unshift(comment);
    this.newComment = comment;
  }

  onCustomFieldChange(event: Event, customFieldName: string) {
    const customFieldValue = event['value'];
    this.saveCustomField(customFieldName, customFieldValue);
  }

  saveInputCustomField(event: Event, customFieldName: string) {
    const customFieldValue = event.target['value'];
    this.saveCustomField(customFieldName, customFieldValue);
  }

  saveCustomField(customFieldName: string, customFieldValue: string) {
    this.utilityService.asyncNotification($localize`:@@fileDetailsDialog.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
      this.filesService.saveCustomField(this.fileData._id, customFieldName, customFieldValue)
        .then(async (res) => {
          this.selectedCFValues[customFieldName] = customFieldValue;
          this.fileData.custom_fields[customFieldName] = customFieldValue;

          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@fileDetailsDialog.detailsUpdated:Details updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@fileDetailsDialog.unableToUpdateDetails:Unable to update the details, please try again!`));
        });
    }));
  }

  async updateDetails() {
    // Prepare the normal  object

    if(this.quillData && this.quillData?.mention){
      this._content_mentions = this.quillData.mention.users.map((user)=> user.insert.mention.id)
    }

    const file: any = {
      original_name: this.original_name,
      description: this.quillData ? JSON.stringify(this.quillData.contents) : this.fileData.content,
      _description_mentions: this._content_mentions,
      tags: this.tags
    };

    await this.utilityService.asyncNotification($localize`:@@fileDetailsDialog.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
      this.filesService.edit(this.fileData?._id, file)
        .then((res) => {
          this.fileData = res['file'];
          this.contentChanged = false;
          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@fileDetailsDialog.detailsUpdated:Details updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@fileDetailsDialog.unableToUpdateDetails:Unable to update the details, please try again!`));
        });
    }));
  }

  /**
   * Call function to delete file
   */
  deleteFile() {
    const id = this.fileData._id;
    this.utilityService.asyncNotification($localize`:@@fileDetailsDialog.pleaseWaitWeAreDeleting:Please wait we are deleting the file...`, new Promise((resolve, reject) => {
      this.filesService.deleteFile(this.fileData._id, this.fileData.modified_name)
        .then((res) => {
          // Emit the Deleted file to all the compoents in order to update the UI
          this.deleteEvent.emit(id);
          // Close the modal
          this.mdDialogRef.close();

          resolve(this.utilityService.resolveAsyncPromise($localize`:@@fileDetailsDialog.fileDeleted:File deleted!`));
        }).catch((err) => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@fileDetailsDialog.unableToDeleteFile:Unable to delete file, please try again!`));
        });
    }));
  }

  /**
   * This function is responsible for receiving the date from @module <app-date-picker></app-date-picker>
   * @param dateObject
   */
  getDate(dateObject: any, cfName: string) {
    this.saveCustomField(cfName, dateObject.toDate());
  }

  onAssigneeEmitter(fileData: any) {
    this.fileData = fileData;
  }

  async onApprovalFlowLaunchedEmiter(fileData: any) {
    this.fileData = fileData;
    this.canEdit = await this.utilityService.canUserDoFileAction(this.fileData, this.groupData, this.userData, 'edit');
  }

  allVersionsDeleted() {
    this.allVersionsDeletedEmitter.emit(this.fileData?._id);
    // Close the modal
    this.mdDialogRef.close();
  }
}
