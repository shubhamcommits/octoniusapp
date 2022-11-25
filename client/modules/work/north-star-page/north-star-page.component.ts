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
  groupsNorthStarTasks: any = [];
  userNorthStarTasks: any = [];

  assignedChartLabels = [$localize`:@@northStarPage.completed:Completed`, $localize`:@@northStarPage.goalsPending:Goals pending`];
  chartType = 'doughnut';
  assignedChartOptions = {
    cutoutPercentage: 50,
    responsive: true,
    legend: {
      display: false
    }
  };
  assignedChartColors = [{
    backgroundColor: [
      '#17B2E3',
      '#F9FAFA'
    ]
  }];
  chartPlugins = [];

  nsAssignedToMe = [];
  assignedToChartReady = false;
  assignedToChartData = [0];
  numAssignedToMe = 0;
  
  nsAssignedByMe = [];
  assignedByChartReady = false;
  assignedByChartData = [0];
  numAssignedByMe = 0;

  generalChartReady = false;
  generalChartOptions = {
    cutoutPercentage: 0,
    responsive: true,
    legend: {
      display: false
    }
  };
  generalChartColors = [{
    backgroundColor: [
      '#26A69A',
      '#EB5757',
      '#FFAB00',
      '#4A90E2'
    ]
  }];
  generalChartLabels = [$localize`:@@northStarPage.onTrack:ON TRACK`, $localize`:@@northStarPage.inDanger:IN DANGER`, $localize`:@@northStarPage.notStarted:NOT STARTED`, $localize`:@@northStarPage.achieved:ACHIEVED`];
  generalChartData = [0];

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

    await this.getUserGroupsNorthStarTasks();

    this.initGraphs();

    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'work'
    });
  }

  async getUserGroupsNorthStarTasks() {
    await this.postService.getUserGroupsNorthStarTasks()
      .then((res) => {
        this.groupsNorthStarTasks = res['posts'];
      })
      .catch(() => {
        this.groupsNorthStarTasks = [];
      });
  }

  async initGraphs() {
    await this.getUserNorthStarTasks();

    // this.assignedChartPlugins = [{
    //     beforeDraw(chart) {
    //       const ctx = chart.ctx;

    //       ctx.textAlign = 'center';
    //       ctx.textBaseline = 'middle';
    //       const centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
    //       const centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);

    //       ctx.font = '25px Nunito';
    //       ctx.fillStyle = '#9d9fa1';

    //       ctx.fillText('No Goals', centerX, centerY);
    //     }
    //   }];

    this.initAssignedToGraph();
    this.initAssignedByGraph();
    this.initGeneralGraph();
  }

  async getUserNorthStarTasks() {
   await this.postService.getUserNorthStarTasks()
    .then((res) => {
      const northstars = res['northstars'];
      this.nsAssignedToMe = northstars.nsAssignedToMe;
      this.nsAssignedByMe = northstars.nsAssignedByMe;
    })
    .catch(() => {
      this.userNorthStarTasks = [];
    });
  }

  async initAssignedToGraph() {
    this.numAssignedToMe = this.nsAssignedToMe.length;
    const completed = await this.nsAssignedToMe.filter(post => post?.task?.northStar?.values[post?.task?.northStar?.values?.length - 1].status == 'ACHIEVED');
    const numCompleted = (completed) ? this.numAssignedToMe - completed.length : 0;
    this.assignedToChartData = [this.numAssignedToMe - numCompleted, numCompleted];
    this.assignedToChartReady = true;
  }

  async initAssignedByGraph() {
    this.numAssignedByMe = this.nsAssignedByMe.length;
    const completed = await this.nsAssignedByMe.filter(post => post?.task?.northStar?.values[post?.task?.northStar?.values?.length - 1].status == 'ACHIEVED');
    const numCompleted = (completed) ? this.numAssignedByMe - completed.length : 0;
    this.assignedByChartData = [numCompleted, this.numAssignedByMe - numCompleted];
    this.assignedByChartReady = true;
  }

  async initGeneralGraph() {
console.log(this.groupsNorthStarTasks);
    const notStarted = await this.groupsNorthStarTasks.filter(post => !post?.task?.northStar?.values[post?.task?.northStar?.values?.length - 1].status || post?.task?.northStar?.values[post?.task?.northStar?.values?.length - 1].status == 'NOT STARTED');
    const onTrack = await this.groupsNorthStarTasks.filter(post => post?.task?.northStar?.values[post?.task?.northStar?.values?.length - 1].status == 'ON TRACK');
    const inDanger = await this.groupsNorthStarTasks.filter(post => post?.task?.northStar?.values[post?.task?.northStar?.values?.length - 1].status == 'IN DANGER');
    const achieved = await this.groupsNorthStarTasks.filter(post => post?.task?.northStar?.values[post?.task?.northStar?.values?.length - 1].status == 'ACHIEVED');
console.log(notStarted);
console.log(onTrack);
console.log(inDanger);
console.log(achieved);
    this.generalChartData = [onTrack?.length, inDanger?.length, notStarted?.length, achieved?.length];
    this.generalChartReady = true;
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
    const indexTask = this.groupsNorthStarTasks.findIndex((task: any) => task._id === id);
    if (indexTask !== -1) {
      this.groupsNorthStarTasks.splice(indexTask, 1);
      return;
    }
  }

  updateTask(task) {
    const indexTask = this.groupsNorthStarTasks.findIndex((t: any) => t._id === task._id);
    if (indexTask !== -1) {
      this.groupsNorthStarTasks[indexTask] = task;
      return;
    }
  }

  createNS() {
    const dialogRef = this.dialog.open(NewNorthStarDialogComponent, {
      data: {
        userId: this.userData?._id,
      },
      hasBackdrop: true
    });

    const nsCreatedEventSubs = dialogRef.componentInstance.nsCreatedEvent.subscribe((data) => {
      if (!this.groupsNorthStarTasks) {
        this.groupsNorthStarTasks = [];
      }
      this.groupsNorthStarTasks.push(data);
    });

    dialogRef.afterClosed().subscribe(result => {
      nsCreatedEventSubs.unsubscribe();
      // this.changeDetection.detectChanges();
    });
  }
}
