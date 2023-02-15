import { Component, OnInit, Injector, OnDestroy } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { environment } from 'src/environments/environment';
import { LoungeService } from 'src/shared/services/lounge-service/lounge.service';
import { MatDialog } from '@angular/material/dialog';
import { EditLoungeComponent } from './edit-lounge/edit-lounge.component';
import moment from 'moment';

@Component({
  selector: 'app-lounge',
  templateUrl: './lounge.component.html',
  styleUrls: ['./lounge.component.scss']
})
export class LoungeComponent implements OnInit, OnDestroy {

  // Workspace data
  public workspaceData: any = {};

  // User data
  public userData: any = {};

  isManager: boolean = false;

  categories = [];
  globalStoriesCategory;

  // IsLoading behaviou subject maintains the state for loading spinner
  public isLoading$ = new BehaviorSubject(false);

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  // Utility Service
  public utilityService = this.injector.get(UtilityService);

  constructor(
    private injector: Injector,
    public dialog: MatDialog,
    private loungeService: LoungeService
  ) { }

  async ngOnInit() {
    // Starts the spinner
    this.isLoading$.next(true);

    // Fetches the workspace data
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    this.userData = await this.publicFunctions.getCurrentUser();

    this.isManager = this.isManagerUser();

    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'work'
    });

    await this.loungeService.getAllCategories(this.workspaceData._id).then (res => {
      this.categories = res['lounges'] || [];
    });

    await this.initCategories();

    // Stops the spinner and return the value with ngOnInit
    return this.isLoading$.next(false);
  }

  ngOnDestroy(){
    this.isLoading$.complete()
  }

  initCategories() {
    this.categories.forEach(cat => {
      cat.items = [];

      if (cat._lounges && cat._lounges.length > 0) {
        cat.items = cat.items.concat(cat._lounges);
      }

      if (cat._stories && cat._stories.length > 0) {
        cat.items = cat.items.concat(cat._stories);
      }

      cat.items.sort((t1, t2) => {
        if (moment.utc(t1.created_date).isBefore(t2.created_date)) {
          return 1;
        } else {
          return -1;
        }
      });

      if (cat.name == 'Global stories') {
        this.globalStoriesCategory = cat;
      }
    });
  }

  onCategoryEmiter(category: any) {
    if (category.name == 'Global stories') {
      this.globalStoriesCategory = category;
    }
    this.categories.push(category);
  }

  onLoungeEmiter(lounge: any) {
    this.openEditLoungeDialog(lounge);
  }

  onStoryEmiter(story: any) {
    this.categories.forEach(cat => {
      if (cat._id == story?._lounge?._id) {
        if (!cat._stories) {
          cat._stories = [];
        }
        if (!cat.items) {
          cat.items = [];
        }
        cat._stories.unshift(story);
        cat.items.unshift(story);
      }
    });
  }

  openEditLoungeDialog(lounge: any) {
    const data = {
        lounge: lounge,
        categories: this.categories
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
    if (lounge.type == 'category') {
      const index = (this.categories) ? this.categories.findIndex(cat => cat._id == lounge._id) : -1;
      if (index >= 0) {
        this.categories[index] = lounge;
      }
    }
  }

  onNewLoungeCreated(lounge: any) {
    const index = (this.categories) ? this.categories.findIndex(cat => cat._id == (lounge._parent._id || lounge._parent)) : -1;
    if (index >= 0) {
      if (!this.categories[index].items) {
        this.categories[index].items = [];
      }

      this.categories[index].items.unshift(lounge);
    }
  }

  isManagerUser() {
    return this.userData.role == 'manager' || this.userData.role == 'admin' || this.userData.role == 'owner';
  }

  cleanStoredData() {
    this.publicFunctions.sendUpdatesToLoungeData({});
    this.publicFunctions.sendUpdatesToStoryData({});
  }
}
