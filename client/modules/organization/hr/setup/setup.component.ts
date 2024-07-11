import { ChangeDetectorRef, Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { HRService } from 'src/shared/services/hr-service/hr.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';
import { EditEntityDialogComponent } from './edit-entity-dialog/edit-entity-dialog.component';
import { NewEntityComponent } from './new-entity/new-entity.component';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss']
})
export class SetupComponent implements OnInit, OnDestroy {

  userData;
  workspaceData;

  workspaceEntities = [];

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  // Utility Service
  public utilityService = this.injector.get(UtilityService);

  // SUBSINK
  // private subSink = new SubSink();

  constructor(
    private injector: Injector,
    public dialog: MatDialog,
    private changeDetection: ChangeDetectorRef,
    private hrService: HRService
  ) { }

  async ngOnInit() {
    // Send Updates to router state
    this.publicFunctions.sendUpdatesToRouterState({
      state: 'hive-hr-setup'
    });

    this.userData = await this.publicFunctions.getCurrentUser();
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();

    this.hrService.getEntities(this.workspaceData?._id).then(res => {
      this.workspaceEntities = res['entities'];
      this.changeDetection.detectChanges();
    });
  }

  ngOnDestroy(): void {
    // this.subSink.unsubscribe();
  }

  /**
    * This function opens up the modal to create an entity, and takes #content in the ng-template inside HTML layout
    */
  async openNewEntity() {
    const dialogRef = this.dialog.open(NewEntityComponent, {
      data: {
        workspaceId: this.workspaceData?._id
      },
      hasBackdrop: true
    });

    const entityCreatedEventSubs = dialogRef.componentInstance.entityCreatedEvent.subscribe((data) => {
      this.workspaceEntities.push(data);
    });

    dialogRef.afterClosed().subscribe(result => {
      entityCreatedEventSubs.unsubscribe();
      this.changeDetection.detectChanges();
    });
  }

  openEntityDetails(entityId: string) {
    const dialogRef = this.dialog.open(EditEntityDialogComponent, {
      data: {
        entityId: entityId
      },
      width: '100%',
      height: '100%',
      disableClose: true,
      hasBackdrop: true
    });

    const entityEditedEventSubs = dialogRef.componentInstance.entityEditedEvent.subscribe((data) => {
      const index = (this.workspaceEntities) ? this.workspaceEntities.findIndex(e => e._id == data._id) : -1;
      if (index >= 0) {
        this.workspaceEntities[index] = data;
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      entityEditedEventSubs.unsubscribe();
      this.changeDetection.detectChanges();
    });
  }

  deleteEntity(entityId: string) {
    this.utilityService.getConfirmDialogAlert($localize`:@@setup.areYouSure:Are you sure?`, $localize`:@@setup.completelyRemoved:By doing this, the entity be completely removed!`)
      .then((res) => {
        if (res.value) {
          this.utilityService.asyncNotification($localize`:@@setup.pleaseWaitDeleting:Please wait we are deleting the entity...`, new Promise((resolve, reject) => {
            this.hrService.delete(entityId).then(res => {
                const index = (this.workspaceEntities) ? this.workspaceEntities.findIndex(e => e._id == entityId) : -1;
                if (index >= 0) {
                  this.workspaceEntities.splice(index, 1);
                  this.changeDetection.detectChanges();
                }

                resolve(this.utilityService.resolveAsyncPromise($localize`:@@setup.deleted:Entity deleted!`));
              }).catch((err) => {
                reject(this.utilityService.rejectAsyncPromise($localize`:@@setup.unableDelete:Unable to delete the entity, please try again!`));
              });
          }));
        }
      });
  }
}
