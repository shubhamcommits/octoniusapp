import { Component, OnInit, Injector } from '@angular/core';
import { PostService } from 'src/shared/services/post-service/post.service';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { environment } from 'src/environments/environment';
import { NewNorthStarDialogComponent } from './new-north-start-dialog/new-north-start-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-north-star-page',
  templateUrl: './north-star-page.component.html',
  styleUrls: ['./north-star-page.component.scss']
})
export class NorthStarPageComponent implements OnInit {

  isIdeaModuleAvailable;
  userData;
  groupData;
  northStarTasks: any = [];

  // Base URL of the uploads
  baseUrl = environment.UTILITIES_USERS_UPLOADS;

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private postService: PostService,
    private utilityService: UtilityService,
    private injector: Injector,
    public dialog: MatDialog,) { }

  async ngOnInit() {
    this.userData = await this.publicFunctions.getCurrentUser();

    // Fetch the current group
    this.groupData = await this.publicFunctions.getCurrentGroupDetails();

    await this.getUserNorthStarTasks();

    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'work'
    });
  }

  getUserNorthStarTasks() {
    new Promise(async (resolve, reject) => {
      await this.postService.getNorthStarTasks()
        .then((res) => {
          this.northStarTasks = res['posts'];
          // res['posts'].forEach(async post => {
          //   const group = (post._group._id) ? post._group._id : post._group;
          //   await this.groupService.getGroup(group).then((group) => {
          //     post._group = group['group'];
          //     this.northStarTasks.push(post);
          //   });
          // });
        })
        .catch(() => {
          reject([])
        });
    });
  }

  getProgressPercent(northStar: any) {
    if (!northStar.values || northStar.values.length == 0 || !northStar.target_value) {
      return 0;
    }

    if (northStar.type !== 'Percent') {
      return (northStar.values[northStar.values.length - 1].value)/northStar.target_value;
    }

    return northStar.values[northStar.values.length - 1].value / 100;
  }

  // getNSStatusClass(northStar) {
  //   let retClass = "percentlabel";
  //   const status = northStar.values[northStar.values.length - 1].status;
  //   if (status === 'ON TRACK') {
  //     retClass += ' on_track';
  //   } else if (status === 'IN DANGER') {
  //     retClass += ' in_danger';
  //   } else if (status === 'ACHIEVED') {
  //     retClass += ' achieved';
  //   } else {
  //     retClass += ' not_started';
  //   }
  //   return retClass;
  // }

  getNSStatusColor(status: string) {
    if (status === 'ON TRACK') {
      return '#26A69A';
    } else if (status === 'IN DANGER') {
      return '#EB5757';
    } else if (status === 'ACHIEVED') {
      return '#4A90E2';
    } else {
      return '#FFAB00';
    }
  }

  /**
   * This function is responsible for opening a fullscreen dialog to edit a task
   */
  openFullscreenModal(postData: any): void {
    const canOpen = !this.groupData?.enabled_rights || postData?.canView || postData?.canEdit;
    const dialogRef = this.utilityService.openPostDetailsFullscreenModal(postData._id, this.groupData._id, this.isIdeaModuleAvailable, canOpen);
    const deleteEventSubs = dialogRef.componentInstance.deleteEvent.subscribe((data) => {
      this.onDeleteEvent(data);
    });

    if (dialogRef) {
      const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe((data) => {
        this.updateTask(data);
      });
      const parentAssignEventSubs = dialogRef.componentInstance.parentAssignEvent.subscribe((data) => {
        this.onDeleteEvent(data._id);
      });
      dialogRef.afterClosed().subscribe(result => {
        closeEventSubs.unsubscribe();
        deleteEventSubs.unsubscribe();
        parentAssignEventSubs.unsubscribe();
      });
    }
  }

  onDeleteEvent(id) {
    const indexTask = this.northStarTasks.findIndex((task: any) => task._id === id);
    if (indexTask !== -1) {
      this.northStarTasks.splice(indexTask, 1);
      return;
    }
  }

  updateTask(task) {
    const indexTask = this.northStarTasks.findIndex((t: any) => t._id === task._id);
    if (indexTask !== -1) {
      this.northStarTasks[indexTask] = task;
      return;
    }
  }

  createNS() {
    const dialogRef = this.dialog.open(NewNorthStarDialogComponent, {
      data: {
        userId: this.userData?._id,
        userGroups: this.userData._groups
      },
      hasBackdrop: true
    });

    const nsCreatedEventSubs = dialogRef.componentInstance.nsCreatedEvent.subscribe((data) => {
      if (!this.northStarTasks) {
        this.northStarTasks = [];
      }
      this.northStarTasks.push(data);
    });

    dialogRef.afterClosed().subscribe(result => {
      nsCreatedEventSubs.unsubscribe();
      // this.changeDetection.detectChanges();
    });
  }
}
