import { Component, EventEmitter, Injector, Input, OnChanges, Output } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';
import { ResourcesGroupService } from 'src/shared/services/resources-group-service /resources-group.service';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-resource-activity',
  templateUrl: './resource-activity.component.html',
  styleUrls: ['./resource-activity.component.scss']
})
export class ResourceActivityComponent implements OnChanges {

  @Input() userData: any;
  @Input() groupData: any;
  @Input() workspaceData: any;
  @Input() resourceData: any;

  @Output() resouceEditedEmitter = new EventEmitter();
  
  resourceId: any;

  isAssignedToUser = false;

  showAddActivityForm = false;
  // entryAlreadyExists = false;

  activityId;
  activityQuantity;
  activityAddInventory;
  activityProject;
  activityDate;
  activityUserId;
  activityUserArray = [];
  activityFile;
  activityComment;

  projects = [];

  quantityPlaceholder = $localize`:@@resourceActivity.quantityPlaceHolder:Enter quantity`;
  projectPlaceholder = $localize`:@@resourceActivity.projectPlaceHolder:Select project`;
  reasonPlaceholder = $localize`:@@resourceActivity.reasonPlaceHolder:Select reason`;
  commentPlaceholder = $localize`:@@resourceActivity.commentPlaceHolder:Comment`;

  members = [];

  publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private resourcesGroupService: ResourcesGroupService,
    private userService: UserService,
    private utilityService: UtilityService,
    private injector: Injector
  ) { }

  async ngOnChanges() {
    if (!this.userData) {
      this.userData = await this.publicFunctions.getCurrentUser();
    }
    
    if (!this.groupData) {
      this.groupData = await this.publicFunctions.getCurrentGroupDetails();
    }

    if (!this.workspaceData) {
      this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    }

    this.resourceId = this.resourceData?._id;

    this.userService.getUserProjects(this.userData._id).then(res => {
      this.projects = res['projects'];
    });

    this.members = await this.publicFunctions.getCurrentGroupMembers();

    // this.activityUserArray = [this.userData];
    // this.activityUserId = this.userData?._id;

    if (!this.activityId) {
      this.initProperties();
    }
  }

  isValidEntry() {
    return !this.showAddActivityForm || (!!this.activityDate && this.activityAddInventory != null && (this.activityAddInventory || (!this.activityAddInventory && !!this.activityProject)) && !!this.activityQuantity && !!this.activityUserId);
  }

  saveEntry(propertyEdited?: string) {
    if (!this.showAddActivityForm) {
      this.showAddActivityForm = !this.showAddActivityForm
    } else if (!this.activityId) {
      const newActivity = {
        quantity: this.activityQuantity,
        add_inventory: this.activityAddInventory,
        _project: this.activityProject,
        date: this.activityDate,
        _user: (!!this.activityUserId) ? this.activityUserId : this.userData?._id,
        file: {},
        comment: this.activityComment
      };

      this.resourcesGroupService.saveActivityEntry(this.resourceData._id, newActivity).then(async (res: any) => {
        this.resourceData = res.resource;
        this.resouceEditedEmitter.emit(this.resourceData);
        this.showAddActivityForm = false;

        this.initProperties();
      });
    } else {
      let editedEntity = {
        _id: this.activityId,
        quantity: this.activityQuantity,
        add_inventory: this.activityAddInventory,
        _project: this.activityProject,
        date: this.activityDate,
        _user: (!!this.activityUserId) ? this.activityUserId : this.userData?._id,
        file: {},
        comment: this.activityComment
      }

      let entryToEdit;
      const index = (this.resourceData.activity) ? this.resourceData.activity.findIndex(entry => entry._id == this.activityId) : -1;
      if (index >= 0) {
        entryToEdit = this.resourceData.activity[index];
      }

      this.utilityService.asyncNotification($localize`:@@resourceActivity.pleaseWait:Please wait we are updating the time...`, new Promise((resolve, reject) => {
        this.resourcesGroupService.editActivityEntry(this.resourceData?._id, editedEntity, propertyEdited)
          .then(async (res: any) => {
            if (!res.error) {
              this.resourceData = res.resource;
              this.resouceEditedEmitter.emit(this.resourceData);

              if (!this.activityId) {
                this.showAddActivityForm = false;
                this.initProperties();
              }

              resolve(this.utilityService.resolveAsyncPromise($localize`:@@resourceActivity.timeEdited:Time Edited!`));
            } else {
              reject(this.utilityService.rejectAsyncPromise($localize`:@@resourceActivity.unableToEdited:Unable to edit Time!`));
            }

            this.resetEntityToEdit(editedEntity._id);
          });
      }));
    }
  }

  cancelNewEntry() {
    this.showAddActivityForm = !this.showAddActivityForm;
    this.initProperties();
  }

  resetEntityToEdit(editedActivityId: string) {
    const index = (this.resourceData.activity)
      ? this.resourceData.activity.findIndex(activity => activity._id == editedActivityId)
      : -1;
    if (index >= 0) {
      this.onEditActivityEntryEvent(this.resourceData.activity[index]);
    }
  }

  onQuantityUpdated($event) {
    if (!!this.activityId && this.isValidEntry()) {
      this.saveEntry('quantity');
    }
  }

  onEditActivityEntryEvent(activityEntity: any) {
    this.activityId = activityEntity?._id;
    this.activityQuantity = activityEntity?.quantity;
    this.activityAddInventory = activityEntity?.add_inventory;
    this.activityProject = activityEntity?._project?._id || activityEntity?._project;
    this.activityDate = activityEntity?.date;
    this.activityUserId = activityEntity?._user?._id || activityEntity?._user;
    this.activityUserArray = [activityEntity?._user];
    this.activityFile = activityEntity?.file;
    this.activityComment = activityEntity?.comment;

    this.showAddActivityForm = true;
  }

  onDeleteActivityEntryEvent(resource: any) {
    this.resourceData = resource;
    this.resouceEditedEmitter.emit(this.resourceData);
  }

  onAssignedAdded(res: any) {
    if (this.activityUserId != (res?.assignee?._id || res?.assignee)) {
      this.activityUserArray = [res?.assignee];
      this.activityUserId = (res?.assignee?._id || res?.assignee);

      if (!!this.activityId && this.isValidEntry()) {
        this.saveEntry('user');
      }
    }
  }

  onAssignedRemoved(userId: string) {
    this.activityUserArray = [];
    this.activityUserId = '';
  }

  /**
   * This function is responsible for receiving the date from @module <app-date-picker></app-date-picker>
   * @param dateObject
   */
  getDate(dateObject: any) {
    const oldDate = this.activityDate;
    this.activityDate = dateObject.toISOString() || null;
    if (!!this.activityDate && this.isValidEntry() && !this.isSameDay(this.activityDate, oldDate)) {
      this.saveEntry('date');
    }
  }

  changeActivityAddInventory($event: any) {
    if (this.activityAddInventory) {
      this.activityProject = null;
    }

    if (!!this.activityId && this.isValidEntry()) {
      this.saveEntry('add_inventory');
    }
  }

  changeActivityProject($event: any) {
    if (!!this.activityId && this.isValidEntry()) {
      this.saveEntry('project');
    }
  }

  onEditComment() {
    if (!!this.activityId && this.isValidEntry()) {
      this.saveEntry('comment')
    }
  }

  initProperties() {
    this.activityId = '';
    this.activityAddInventory = null;
    this.activityProject = '';
    this.activityDate = '';
    this.activityUserId = this.userData?._id;
    this.activityUserArray = [this.userData];
    this.activityFile = {};
    this.activityComment = '';
  }

  isSameDay(day1: any, day2: any) {
    if (!day1 && !day2) {
      return true;
    } else if ((!!day1 && !day2) || (!!day2 && !day1)) {
      return true;
    }
    return moment.utc(day1).isSame(moment.utc(day2), 'day');
  }

  isGroupManager(userId) {
    return (this.groupData && this.groupData._admins) ? this.groupData._admins.find(admin => admin._id === userId) : false;
  }

  formateDate(date) {
    return (date) ? moment.utc(date).add('1', 'day').format("MMM D, YYYY") : '';
  }
}
