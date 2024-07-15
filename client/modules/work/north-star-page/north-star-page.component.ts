import { Component, OnInit, Injector, ChangeDetectorRef } from '@angular/core';
import { PostService } from 'src/shared/services/post-service/post.service';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { NewNorthStarDialogComponent } from './new-north-start-dialog/new-north-start-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { GlobalNorthStarDialogComponent } from 'src/app/common/shared/posts/global-north-star-dialog/global-north-star-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-north-star-page',
  templateUrl: './north-star-page.component.html',
  styleUrls: ['./north-star-page.component.scss']
})
export class NorthStarPageComponent implements OnInit {

  isIdeaModuleAvailable;
  userData;
  // groupData;
  globalNorthStarTasks: any = [];

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

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public dialog: MatDialog,
    public utilityService: UtilityService,
    private postService: PostService,
    private injector: Injector,
    private _router: Router,
    private changeDetectorRef: ChangeDetectorRef,
  ) { }

  async ngOnInit() {
    if (this._router.routerState.snapshot.root.queryParamMap.has('postId')) {
      const postId = this._router.routerState.snapshot.root.queryParamMap.get('postId');
      let post: any = await this.publicFunctions.getPost(postId);
      this.openGlobalNSModal(postId, (post?.task?._parent_task?._id || post?.task?._parent_task));
    }

    this.userData = await this.publicFunctions.getCurrentUser();

    await this.getUserGlobalNorthStarTasks();

    // this.initGraphs();

    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'work'
    });
  }

  async getUserGlobalNorthStarTasks() {
    await this.postService.getUserGlobalNorthStarTasks()
      .then((res) => {
        this.globalNorthStarTasks = res['posts'];
      })
      .catch(() => {
        this.globalNorthStarTasks = [];
      });
  }

  // async initGraphs() {
  //   await this.getGlobalNorthStarTasks();

  //   this.initAssignedToGraph();
  //   this.initAssignedByGraph();
  //   this.initGeneralGraph();
  // }

  // async getGlobalNorthStarTasks() {
  //  await this.postService.getGlobalNorthStarTasks()
  //   .then((res) => {
  //     const northstars = res['northstars'];
  //     this.nsAssignedToMe = northstars.nsAssignedToMe;
  //     this.nsAssignedByMe = northstars.nsAssignedByMe;
  //   })
  //   .catch(() => {
  //     this.nsAssignedToMe = [];
  //     this.nsAssignedByMe = [];
  //   });
  // }

  // async initAssignedToGraph() {
  //   this.numAssignedToMe = this.nsAssignedToMe.length;
  //   const completed = await this.nsAssignedToMe.filter(post => post?.task?.northStar?.values[post?.task?.northStar?.values?.length - 1].status == 'ACHIEVED');
  //   const numCompleted = (completed) ? this.numAssignedToMe - completed.length : 0;
  //   this.assignedToChartData = [this.numAssignedToMe - numCompleted, numCompleted];
  //   this.assignedToChartReady = true;
  // }

  // async initAssignedByGraph() {
  //   this.numAssignedByMe = this.nsAssignedByMe.length;
  //   const completed = await this.nsAssignedByMe.filter(post => post?.task?.northStar?.values[post?.task?.northStar?.values?.length - 1].status == 'ACHIEVED');
  //   const numCompleted = (completed) ? this.numAssignedByMe - completed.length : 0;
  //   this.assignedByChartData = [this.numAssignedByMe - numCompleted, numCompleted];
  //   this.assignedByChartReady = true;
  // }

  // async initGeneralGraph() {
  //   const notStarted = await this.globalNorthStarTasks.filter(post => !post?.task?.northStar?.values[post?.task?.northStar?.values?.length - 1].status || post?.task?.northStar?.values[post?.task?.northStar?.values?.length - 1].status == 'NOT STARTED');
  //   const onTrack = await this.globalNorthStarTasks.filter(post => post?.task?.northStar?.values[post?.task?.northStar?.values?.length - 1].status == 'ON TRACK');
  //   const inDanger = await this.globalNorthStarTasks.filter(post => post?.task?.northStar?.values[post?.task?.northStar?.values?.length - 1].status == 'IN DANGER');
  //   const achieved = await this.globalNorthStarTasks.filter(post => post?.task?.northStar?.values[post?.task?.northStar?.values?.length - 1].status == 'ACHIEVED');

  //   this.generalChartData = [onTrack?.length, inDanger?.length, notStarted?.length, achieved?.length];
  //   this.generalChartReady = true;
  // }

  getProgressPercent(northStarValues: any) {
    if (!northStarValues || northStarValues?.length == 0) {
      return 0;
    }

    return (northStarValues.filter(ns => (ns?.status == 'ACHIEVED' || ns?.status?.toUpperCase() == 'DONE')).length || 0) / northStarValues.length;
  }

  getNSStatusColor(northStarValues: any) {
    if (!!northStarValues) {
      const progressPercentage = this.getProgressPercent(northStarValues);

      if (progressPercentage == 1) {
        return '#4A90E2';
      } else if (northStarValues?.findIndex(val => val.status == 'IN DANGER') >= 0) {
        return '#EB5757';
      } else if (northStarValues?.findIndex(val => val.status == 'ON TRACK') >= 0) {
        return '#26A69A';
      } else {
        return '#FFAB00';      
      }
    }
  }

  /**
   * This function is responsible for opening a fullscreen dialog to edit a task
   */
  openGlobalNSModal(postId: string, parentTaskId?: string): void {
    const dialogRef = this.dialog.open(GlobalNorthStarDialogComponent, {
          minWidth: '100%',
          width: '100%',
          minHeight: '100%',
          height: '100%',
          disableClose: true,
          data: {
            postId: postId,
            parentTaskId: parentTaskId
          }
        });
    const deleteEventSubs = dialogRef.componentInstance.deleteEvent.subscribe((data) => {
      this.onDeleteEvent(data);
    });

    if (dialogRef) {
      const closeEventSubs = dialogRef.componentInstance.closeEvent.subscribe((data) => {
        this.updateTask(data);
        
        this.changeDetectorRef.detectChanges();
      });

      dialogRef.afterClosed().subscribe(result => {
        closeEventSubs.unsubscribe();
        deleteEventSubs.unsubscribe();
        
        this.changeDetectorRef.detectChanges();
      });
    }
  }

  onDeleteEvent(id) {
    const indexTask = this.globalNorthStarTasks.findIndex((task: any) => task._id === id);
    if (indexTask !== -1) {
      this.globalNorthStarTasks.splice(indexTask, 1);
      return;
    }
  }

  updateTask(task) {
    const indexTask = this.globalNorthStarTasks.findIndex((t: any) => t._id === task._id);
    if (indexTask !== -1) {
      this.globalNorthStarTasks[indexTask] = task;
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
      if (!this.globalNorthStarTasks) {
        this.globalNorthStarTasks = [];
      }
      this.globalNorthStarTasks.push(data);
    });

    dialogRef.afterClosed().subscribe(result => {
      nsCreatedEventSubs.unsubscribe();
      // this.changeDetection.detectChanges();
    });
  }
}
