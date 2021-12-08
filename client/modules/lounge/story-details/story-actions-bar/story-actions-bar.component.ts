import { Component, OnInit, OnChanges, Injector, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { environment } from 'src/environments/environment';
import { LoungeService } from 'src/shared/services/lounge-service/lounge.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { LoungeImageUpdateComponent } from '../../lounge-image-update/lounge-image-update.component';
import moment from 'moment';

@Component({
  selector: 'app-story-actions-bar',
  templateUrl: './story-actions-bar.component.html',
  styleUrls: ['./story-actions-bar.component.scss']
})
export class StoryActionsBarComponent implements OnInit, OnChanges {

  @Input() storyData: any;
  @Input() workspaceData: any = {};
  @Input() userData: any = {};
  @Input() canEditStory: boolean = false;
  @Input() isManager: boolean = false;
  @Input() showComments: boolean = false;

  @Output() onEditActionEvent = new EventEmitter();
  @Output() onShowCommentsActionEvent = new EventEmitter();

  goingToEvent: boolean = false;
  notGoingToEvent: boolean = false;
  maybeGoingToEvent: boolean = false;

  eventTime: any = {
    hour: 1,
    minute: 30
  }

  // Base URL
  baseUrl = environment.UTILITIES_WORKSPACES_UPLOADS;

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector,
    public dialog: MatDialog,
    private _router: Router,
    private utilityService: UtilityService,
    private loungeService: LoungeService
  ) { }

  async ngOnInit() {
    await this.initAssistance();

    if (this.storyData.event_date) {
      this.eventTime.hour = this.storyData.event_date.getHours();
      this.eventTime.minute = this.storyData.event_date.getMinutes();
    }
  }

  async ngOnChanges() {
    await this.initAssistance();
  }

  canEditAction() {
    this.canEditStory = true;
    this.onEditActionEvent.emit();
  }

  initAssistance() {
    if (this.storyData) {
      this.goingToEvent = (((this.storyData?._assistants) ? this.storyData?._assistants.findIndex(assistant => assistant._id == this.userData._id) : -1) >= 0);
      this.maybeGoingToEvent = (((this.storyData?._maybe_assistants) ? this.storyData?._maybe_assistants.findIndex(assistant => assistant._id == this.userData._id) : -1) >= 0);
      this.notGoingToEvent = (((this.storyData?._rejected_assistants) ? this.storyData?._rejected_assistants.findIndex(assistant => assistant._id == this.userData._id) : -1) >= 0);
    }
  }

  confirmAssistance() {
    this.utilityService.asyncNotification($localize`:@@storyDetails.pleaseWaitWeSend:Please wait we are sending your assistance response...`, new Promise((resolve, reject) => {
      this.loungeService.confirmAssistance(this.storyData._id)
        .then((res) => {
          this.storyData = res ['story'];
          this.initAssistance();
          this.publicFunctions.sendUpdatesToStoryData(this.storyData);

          resolve(this.utilityService.resolveAsyncPromise($localize`:@@storyDetails.going:You have confirmed you are going to the event!`));
        })
        .catch((err) => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@storyDetails.unableToSend:Unable to send your assistance response, please try again!`))
        });
    }));
  }

  rejectAssistance() {
    this.utilityService.asyncNotification($localize`:@@storyDetails.pleaseWaitWeSend:Please wait we are sending your assistance response...`, new Promise((resolve, reject) => {
      this.loungeService.rejectAssistance(this.storyData._id)
        .then((res) => {
          this.storyData = res ['story'];
          this.initAssistance();
          this.publicFunctions.sendUpdatesToStoryData(this.storyData);

          resolve(this.utilityService.resolveAsyncPromise($localize`:@@storyDetails.notGoing:You declined the invitation!`));
        })
        .catch((err) => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@storyDetails.unableToSend:Unable to send your assistance response, please try again!`))
        });
    }));
  }

  doubtAssistance() {
    this.utilityService.asyncNotification($localize`:@@storyDetails.pleaseWaitWeSend:Please wait we are sending your assistance response...`, new Promise((resolve, reject) => {
      this.loungeService.doubtAssistance(this.storyData._id)
        .then((res) => {
          this.storyData = res ['story'];
          this.initAssistance();
          this.publicFunctions.sendUpdatesToStoryData(this.storyData);

          resolve(this.utilityService.resolveAsyncPromise($localize`:@@storyDetails.mayGo:You may go to the event!`));
        })
        .catch((err) => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@storyDetails.unableToSend:Unable to send your assistance response, please try again!`))
        });
    }));
  }

  deleteStory(storyId: string) {
    // Open the Confirm Dialog to ask for permission
    this.utilityService.getConfirmDialogAlert($localize`:@@storyDetails.areYouSure:Are you sure?`, $localize`:@@storyDetails.byDoingThisTasksWillBeDeleted:By doing this the story will be deleted!`)
      .then((res) => {
        if (res.value) {

          // Call the HTTP Service function
          this.utilityService.asyncNotification($localize`:@@storyDetails.pleaseWaitWeRemovingStory:Please wait we are removing your story...`, new Promise((resolve, reject) => {
            this.loungeService.deleteStory(storyId)
              .then((res) => {
                this.publicFunctions.sendUpdatesToLoungeData({});
                this.publicFunctions.sendUpdatesToStoryData({});

                this.goBack();

                resolve(this.utilityService.resolveAsyncPromise($localize`:@@storyDetails.storyRemoved:Story Removed!`));
              })
              .catch((err) => {
                reject(this.utilityService.rejectAsyncPromise($localize`:@@storyDetails.unableToRemoveStory:Unable to remove the story at the moment, please try again!`))
              });
          }));
        }
      });
  }

  async goBack() {
    if (this.storyData && this.storyData._lounge) {
      this._router.navigate(
        ['/dashboard', 'work', 'lounge', 'details'],
        {
          queryParams: {
            lounge: this.storyData._lounge._id
          }
        }
      );
    }
  }

  /**
    * This function opens up the task content in a new modal, and takes #content in the ng-template inside HTML layout
    * @param content
    */
  async openImageSelector(property) {
    if (this.canEditStory || property == 'icon_pic') {
      const data =
      {
        elementData: this.storyData,
        elementPropertyName: property
      };

      const dialogRef = this.dialog.open(LoungeImageUpdateComponent, {
        width: '50%',
        disableClose: true,
        hasBackdrop: true,
        data: data
      });

      const elementImageUpdatedEventSubs = dialogRef.componentInstance.elementImageUpdatedEvent.subscribe((data) => {
        this.editStory(data);
      });

      dialogRef.afterClosed().subscribe(result => {
        elementImageUpdatedEventSubs.unsubscribe();
      });
    }
  }

  /**
   * Edit the story with the new value
   */
  async editStory(story: any) {
    this.storyData = story;
    this.publicFunctions.sendUpdatesToStoryData(this.storyData);
  }

  showCommentsAction() {
    this.showComments = !this.showComments;
    this.onShowCommentsActionEvent.emit(this.showComments);
  }

  formateDate(date){
    return moment(moment.utc(date), "MMM dd, yyyy HH:mm").toDate();
  }

  /**
   * This function is responsible for receiving the date from @module <app-date-picker></app-date-picker>
   * @param dateObject
   */
  getDate(dateObject: any) {
    this.updateDate(dateObject.toDate());
  }

  updateDate(date: any) {
    this.utilityService.asyncNotification($localize`:@@groupCreatePostDialog.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
      this.loungeService.editStory(this.storyData?._id, { 'event_date': date }).then(res => {
          this.storyData = res['story'];
          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupCreatePostDialog.dateUpdated:Date updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@groupCreatePostDialog.unableToUpdateDetails:Unable to update the details, please try again!`));
        });
    }));
  }

  /**
   * This function is responsible for receiving the time from @module <app-time-picker></app-time-picker>
   * @param timeObject
   */
  getTime(timeObject: any) {
    this.eventTime = timeObject;
    const now = moment(this.storyData.event_date);
    now.hours(this.eventTime.hour);
    now.minute(this.eventTime.minute);
    this.storyData.event_date  = now;

    this.loungeService.editStory(this.storyData?._id, { 'event_date': moment(this.storyData.event_date).format("MMM dd, yyyy HH:mm") }).then(res => {
      this.storyData = res['story'];
    });
  }
}
