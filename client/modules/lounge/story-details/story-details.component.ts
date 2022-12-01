import { Component, OnInit, Injector, OnDestroy, Input } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { environment } from 'src/environments/environment';
import { LoungeService } from 'src/shared/services/lounge-service/lounge.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { LoungeImageUpdateComponent } from '../lounge-image-update/lounge-image-update.component';
import moment from 'moment';

@Component({
  selector: 'app-story-details',
  templateUrl: './story-details.component.html',
  styleUrls: ['./story-details.component.scss']
})
export class StoryDetailsComponent implements OnInit, OnDestroy {

  @Input() storyId = this.router.snapshot.queryParamMap.get('story');

  // Base URL
  baseUrl = environment.UTILITIES_WORKSPACES_UPLOADS;

  // Workspace data
  public workspaceData: any = {};

  // User data
  public userData: any = {};

  isManager: boolean = false;

  storyData: any = {};

  canEditStory: boolean = false;

  // Quill Data Object
  quillData: any;

  // Content Mentions Variables keeps a track of mentioned members
  _content_mentions: any = [];

  newComment: any;
  showComments: boolean = false;

  editTime = false;
  eventTime: any = {
    hour: 1,
    minute: 30
  };
  eventTimeStr = '';

  am_pm = '';
  editAMPM = false;

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector,
    public dialog: MatDialog,
    private router: ActivatedRoute,
    private utilityService: UtilityService,
    private loungeService: LoungeService
  ) {
    this.storyId = this.router.snapshot.queryParamMap.get('story');
  }

  async ngOnInit() {
    // Starts the spinner
    this.isLoading$.next(true);

    // Fetches the workspace data
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    this.userData = await this.publicFunctions.getCurrentUser();

    this.isManager = this.isManagerUser();

    if (this.storyId) {
      await this.loungeService.getStory(this.storyId).then (async res => {
        this.storyData = res['story'] || {};
        await this.initStoryHeaderImage();
        this.publicFunctions.sendUpdatesToStoryData(this.storyData);
      });
    }

    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'lounge'
    });

    // Stops the spinner and return the value with ngOnInit
    return this.isLoading$.next(false);
  }

  ngOnDestroy(){
    this.isLoading$.complete();
  }

  canEditAction() {
    this.canEditStory = !this.canEditStory;

    if (this.storyData.event_date) {
      const eventMoment = moment(this.storyData.event_date);
      this.eventTime.hour = eventMoment.hours();
      this.eventTime.minute = eventMoment.minutes();

      if (this.eventTime.hour >= 12) {
        this.am_pm = 'PM';
        if (this.eventTime.hour > 12) {
          this.eventTime.hour = this.eventTime.hour - 12;
        }
      } else {
        this.am_pm = 'AM';
      }
      this.eventTimeStr = this.eventTime.hour + ':' + ((this.eventTime.minute < 10) ? '0' : '') + this.eventTime.minute;
    }
  }

  initStoryHeaderImage() {
    if (this.storyData.header_pic && !this.storyData.header_pic.includes('assets/images')) {
      this.storyData.header_pic = this.baseUrl + '/' + this.storyData.header_pic + '?noAuth=true';
    } else {
      this.storyData.header_pic = 'assets/images/lounge_details_header.jpg';
    }
  }
  /**
   * Edit the lounge in the proper array with the new values
   */
  async editStory(story: any) {
    this.storyData = story;
    await this.initStoryHeaderImage();
    this.publicFunctions.sendUpdatesToStoryData(this.storyData);
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
   * Get Quill Data from the @module <quill-editor></quill-editor>
   *  Show update detail option if post content has been changed
   * @param quillData
   */
  getQuillData(quillData: any) {

    // Set the quill data object to the quillData output
    this.quillData = quillData

    // Filter the Mention users content and map them into arrays of Ids
    if(this.quillData && this.quillData?.mention){
      this._content_mentions = this.quillData?.mention?.users?.map((user) => user.insert.mention.id);
    }

    // If content mentions has 'all' then only pass 'all' inside the array
    if (this._content_mentions.includes('all'))
      this._content_mentions = ['all']

    // Set the values of the array
    this._content_mentions = Array.from(new Set(this._content_mentions))
  }

  saveStory() {
    if (this.quillData) {
      this.utilityService.asyncNotification($localize`:@@storyDetails.pleaseWaitWeUpdateStory:Please wait we are updating the story...`,
      new Promise(async (resolve, reject) => {
        const content = JSON.stringify(this.quillData.contents);
        // Call HTTP Request to change the assignee
        this.loungeService.editStory(this.storyData?._id, { 'content': content, '_content_mentions': this._content_mentions }).then(async res => {
            this.storyData = res['story'];
            await this.initStoryHeaderImage();
            this.canEditStory = !this.canEditStory;
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@storyDetails.storyUpdated:Story updated`))
          })
          .catch(() => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@storyDetails.unableToUpdate:Unable to update the story, please try again!`))
          });
      }));
    } else {
      this.canEditStory = !this.canEditStory;
    }
  }

  newCommentReceived(comment: any) {
    if (!this.storyData._comments) {
      this.storyData._comments = [];
    }
    this.storyData._comments.unshift(comment);
    this.newComment = comment;
    this.showComments = !this.showComments;
  }

  showCommentsAction(action: boolean) {
    this.showComments = action;
  }

  onRemoveComment(commentId: string) {
    const index = (this.storyData._comments) ? this.storyData._comments.findIndex(c => c._id == commentId) : -1;
    if (index >= 0) {
      this.storyData._comments.splice(index, 1);
    }
  }

  isManagerUser() {
    return this.userData.role == 'manager' || this.userData.role == 'admin' || this.userData.role == 'owner';
  }
  
  getDate(dateObject: any) {
    const now = moment(dateObject.toDate());
    now.hours(this.eventTime.hour);
    now.minute(this.eventTime.minute);
    this.storyData.event_date  = now;
    this.updateDate(this.storyData.event_date);
  }

  enableEditTime() {
    this.editTime = !this.editTime;
  }

  getTime(timeObject: string) {
    this.eventTimeStr = timeObject;
    
    if (!this.isValidTime(this.eventTimeStr)) {
      return this.utilityService.errorNotification($localize`:@@storyDetails.wrongTimeFormat:Wront time format, hh:mm!`);
    }

    let time = this.eventTimeStr.split(':');
    this.eventTime.hour = time[0];
    this.eventTime.minute = time[1];

    const now = moment(this.storyData.event_date);
    now.hours((this.am_pm == 'PM') ? this.eventTime.hour + 12 : this.eventTime.hour);
    now.minute(this.eventTime.minute);
    this.storyData.event_date  = now;
    this.enableEditTime();
    this.updateDate(this.storyData.event_date);
  }

  getAMPM(ampm: string) {
    this.am_pm = ampm;
    const now = moment(this.storyData.event_date);
    now.hours((this.am_pm == 'PM') ? this.eventTime.hour + 12 : this.eventTime.hour);
    now.minute(this.eventTime.minute);
    this.storyData.event_date  = now;
    this.updateDate(this.storyData.event_date);
  }

  updateDate(date: any) {
    this.utilityService.asyncNotification($localize`:@@storyDetails.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
      this.loungeService.editStory(this.storyData?._id, { 'event_date': date }).then(res => {
          this.storyData = res['story'];
          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@storyDetails.dateUpdated:Date updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@storyDetails.unableToUpdateDetails:Unable to update the details, please try again!`));
        });
    }));
  }

  formateDate(date) {
    return (date) ? moment(moment.utc(date), "YYYY-MM-DD").toDate() : '';
  }

  isValidTime(str) {
    // time in 12-hour format
    let regex = new RegExp(/((1[0-2]|0?[1-9]):([0-5][0-9]))/);
 
    if (str == null) {
        return false;
    }

    if (regex.test(str) == true) {
        return true;
    }
    else {
        return false;
    }
}
}
