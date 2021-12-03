import { Component, OnInit, Injector, OnDestroy, Input } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { environment } from 'src/environments/environment';
import { LoungeService } from 'src/shared/services/lounge-service/lounge.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { LoungeImageUpdateComponent } from '../lounge-image-update/lounge-image-update.component';

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
  quillData: any

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
      await this.loungeService.getStory(this.storyId).then (res => {
        this.storyData = res['story'] || {};
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

  /**
   * Edit the lounge in the proper array with the new values
   */
  async editStory(story: any) {
    this.storyData = story;
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

    /*
    // Filter the Mention users content and map them into arrays of Ids
    if(this.quillData && this.quillData?.mention){
      this._content_mentions = this.quillData?.mention?.users?.map((user) => user.insert.mention.id);
    }

    // If content mentions has 'all' then only pass 'all' inside the array
    if (this._content_mentions.includes('all'))
      this._content_mentions = ['all']

    // Set the values of the array
    this._content_mentions = Array.from(new Set(this._content_mentions))
    */
  }

  saveStory() {
    this.utilityService.asyncNotification($localize`:@@storyDetails.pleaseWaitWeUpdateStory:Please wait we are updating the story...`,
      new Promise(async (resolve, reject) => {
        const content = this.quillData ? JSON.stringify(this.quillData.contents) : "";
        // Call HTTP Request to change the assignee
        this.loungeService.editStory(this.storyData?._id, { 'content': content }).then(res => {
            this.storyData = res['story'];
            this.canEditStory = !this.canEditStory;
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@storyDetails.storyUpdated:Story updated`))
          })
          .catch(() => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@storyDetails.unableToUpdate:Unable to update the story, please try again!`))
          });
      }));
  }

  isManagerUser() {
    return this.userData.role == 'manager' || this.userData.role == 'admin' || this.userData.role == 'owner';
  }
}
