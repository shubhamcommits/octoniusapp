import { Component, OnInit, Injector, OnDestroy, Input } from '@angular/core';
import { Location } from '@angular/common'
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { environment } from 'src/environments/environment';
import { LoungeService } from 'src/shared/services/lounge-service/lounge.service';
import { MatDialog } from '@angular/material/dialog';
import moment from 'moment';
import { EditLoungeComponent } from '../lounge/edit-lounge/edit-lounge.component';
import { ActivatedRoute, Router } from '@angular/router';
import { LoungeImageUpdateComponent } from '../lounge-image-update/lounge-image-update.component';

@Component({
  selector: 'app-lounge-details',
  templateUrl: './lounge-details.component.html',
  styleUrls: ['./lounge-details.component.scss']
})
export class LoungeDetailsComponent implements OnInit, OnDestroy {

  @Input() loungeId = this.router.snapshot.queryParamMap.get('lounge');

  // Base URL
  baseUrl = environment.UTILITIES_WORKSPACES_UPLOADS;

  // Workspace data
  public workspaceData: any = {};

  // User data
  public userData: any = {};

  isManager: boolean = false;

  loungeData: any = {};
  categories: any = [];

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  // Utility Service
  public utilityService = this.injector.get(UtilityService);

  constructor(
    private injector: Injector,
    public dialog: MatDialog,
    private router: ActivatedRoute,
    private _router: Router,
    private loungeService: LoungeService
  ) {
    this.loungeId = this.router.snapshot.queryParamMap.get('lounge');
  }

  async ngOnInit() {
    // Starts the spinner
    this.isLoading$.next(true);

    // Fetches the workspace data
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    this.userData = await this.publicFunctions.getCurrentUser();

    this.isManager = this.isManagerUser();

    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'lounge'
    });

    await this.loungeService.getLounge(this.loungeId).then (res => {
      this.loungeData = res['lounge'] || {};
    });

    await this.initLounge();

    this.loungeService.getAllCategories(this.workspaceData._id).then (res => {
      this.categories = res['lounges'] || [];
    });

    // Stops the spinner and return the value with ngOnInit
    return this.isLoading$.next(false);
  }

  ngOnDestroy(){
    this.isLoading$.complete()
  }

  initLounge() {
    this.loungeData.items = [];

    if (this.loungeData._lounges && this.loungeData._lounges.length > 0) {
      this.loungeData.items = this.loungeData.items.concat(this.loungeData._lounges);
    }

    if (this.loungeData._stories && this.loungeData._stories.length > 0) {
      this.loungeData.items = this.loungeData.items.concat(this.loungeData._stories);
    }

    this.loungeData.items.sort((t1, t2) => {
      if (moment.utc(t1.created_date).isBefore(t2.created_date)) {
        return 1;
      } else {
        return -1;
      }
    });

    if (this.loungeData.header_pic && !this.loungeData.header_pic.includes('assets/images')) {
      this.loungeData.header_pic = this.baseUrl + '/' + this.workspaceData?._id + '/' + this.loungeData.header_pic + '?noAuth=true';
    } else {
      this.loungeData.header_pic = 'assets/images/lounge_details_header.jpg';
    }

    this.publicFunctions.sendUpdatesToLoungeData(this.loungeData);
  }

  onLoungeEmiter(lounge: any) {
    this.openEditLoungeDialog(lounge, 'new');
  }

  onStoryEmiter(story: any) {
    this.loungeData._stories.unshift(story);
    this.loungeData.items.unshift(story);
    this.publicFunctions.sendUpdatesToLoungeData(this.loungeData);
  }

  openEditLoungeDialog(lounge: any, action_type: string) {
    const data = (this.loungeData?.type == 'category' || (action_type == 'edit' && this.loungeData?._parent?.type == 'category')) ?
      {
        lounge: lounge,
        parent: this.loungeData?._id,
        categories: this.categories
      } : {
        lounge: lounge,
        parent: this.loungeData?._id
      };

    const dialogRef = this.dialog.open(EditLoungeComponent, {
      width: '50%',
      height: '50%',
      disableClose: true,
      hasBackdrop: true,
      data: data
    });

    const loungeEditEventSubs = dialogRef.componentInstance.loungeEditEvent.subscribe((data) => {
      this.editLounge(data);
    });

    const newLoungeEventSubs = dialogRef.componentInstance.newLoungeEvent.subscribe((data) => {
      this.onNewLoungeCreated(data);
    });
    const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe((data) => {});

    dialogRef.afterClosed().subscribe(result => {
      loungeEditEventSubs.unsubscribe();
      newLoungeEventSubs.unsubscribe();
      closeEventSubs.unsubscribe();
    });
  }

  /**
   * Edit the lounge in the proper array with the new values
   */
  async editLounge(lounge: any) {
    this.loungeData = lounge;
    await this.initLounge();
  }

  onNewLoungeCreated(lounge: any) {
    if ((this.loungeData.type == 'lounge' && (lounge._parent._id || lounge._parent) == (this.loungeData._parent._id || this.loungeData._parent))
        || (this.loungeData.type == 'category' && (lounge._parent._id || lounge._parent) == this.loungeData._id)) {
      this.loungeData._lounges.unshift(lounge);
      this.loungeData.items.unshift(lounge);
      this.publicFunctions.sendUpdatesToLoungeData(this.loungeData);
    }
  }

  deleteLounge(loungeId: string) {
    // Open the Confirm Dialog to ask for permission
    this.utilityService.getConfirmDialogAlert($localize`:@@loungeDetails.areYouSure:Are you sure?`, $localize`:@@loungeDetails.byDoingThisTasksWillBeDeleted:By doing this all the stories and lounges from this lounge will be deleted!`)
      .then((res) => {
        if (res.value) {

          // Call the HTTP Service function
          this.utilityService.asyncNotification($localize`:@@loungeDetails.pleaseWaitWeRemovingLounge:Please wait we are removing your lounge...`, new Promise((resolve, reject) => {
            this.loungeService.deleteLounge(loungeId)
              .then((res) => {
                this.publicFunctions.sendUpdatesToLoungeData({});
                this.publicFunctions.sendUpdatesToStoryData({});

                this.goBack();

                resolve(this.utilityService.resolveAsyncPromise($localize`:@@loungeDetails.loungeRemoved:Lounge Removed!`));
              })
              .catch((err) => {
                reject(this.utilityService.rejectAsyncPromise($localize`:@@loungeDetails.unableToRemoveLounge:Unable to remove the lounge at the moment, please try again!`))
              })
          }));
        }
      });
  }

  async goBack() {
    if (this.loungeData.type == 'category') {
      this._router.navigate(['/dashboard', 'work', 'lounge']);
    } else if (this.loungeData._parent) {
      this._router.navigate(
        ['/dashboard', 'work', 'lounge', 'details'],
        {
          queryParams: {
            lounge: this.loungeData._parent._id
          }
        }
      );
    }
  }

  isManagerUser() {
    return this.userData.role == 'manager' || this.userData.role == 'admin' || this.userData.role == 'owner';
  }

  /**
    * This function opens up the task content in a new modal, and takes #content in the ng-template inside HTML layout
    * @param content
    */
  async openImageSelector(property) {
    const data =
    {
      elementData: this.loungeData,
      elementPropertyName: property
    };

    const dialogRef = this.dialog.open(LoungeImageUpdateComponent, {
      width: '50%',
      disableClose: true,
      hasBackdrop: true,
      data: data
    });

    const elementImageUpdatedEventSubs = dialogRef.componentInstance.elementImageUpdatedEvent.subscribe((data) => {
      this.editLounge(data);
    });

    dialogRef.afterClosed().subscribe(result => {
      elementImageUpdatedEventSubs.unsubscribe();
    });
  }

  cleanStoredData() {
    this.publicFunctions.sendUpdatesToLoungeData({});
    this.publicFunctions.sendUpdatesToStoryData({});
  }
}
