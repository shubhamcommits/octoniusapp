import { Component, EventEmitter, Inject, Injector, Input, OnInit, Output } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { PublicFunctions } from 'modules/public.functions';
import { CountryCurrencyService } from 'src/shared/services/country-currency/country-currency.service';
import { HRService } from 'src/shared/services/hr-service/hr.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';

@Component({
  selector: 'app-entity-add-members-dialog',
  templateUrl: './entity-add-members-dialog.component.html',
  styleUrls: ['./entity-add-members-dialog.component.scss']
})
export class EntityAddMembersDialogComponent implements OnInit {

  @Output() memberAddedEvent = new EventEmitter();

  entityId;
  entityData: any = {};

  workspaceData;

  entityMembers = [];
  workspaceMembers = [];

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    private hrService: HRService,
    private workspaceService: WorkspaceService,
    private injector: Injector,
    private mdDialogRef: MatDialogRef<EntityAddMembersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.entityId = this.data.entityId;
  }

  async ngOnInit() {

    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    // this.hrService.getEntityDetails(this.entityId).then(res => {
    //   this.entityData = res['entity'];
    // });

    this.hrService.getEntityMembers(this.entityId).then(res => {
      this.entityMembers = res['members'];
    });

    this.workspaceService.getWorkspaceUsers(this.workspaceData?._id).then(res => {
      this.workspaceMembers = res['users'];
    });
  }

  addMemberToEntity(member: any) {
    this.utilityService.getConfirmDialogAlert($localize`:@@editentitydialog.areYouSure:Are you sure?`, $localize`:@@editentitydialog.addToEntity:By doing this, the user will be added to the entity!`)
      .then((res) => {
        if (res.value) {
          this.utilityService.asyncNotification($localize`:@@editentitydialog.pleaseWaitAddinggMember:Please wait we are adding the member...`, new Promise((resolve, reject) => {
            this.hrService.addMemberToEntity(this.entityId, member?._id).then(res => {
              const index = (this.entityMembers) ? this.entityMembers.findIndex(v => v._id == member?._id) : -1;
              if (index < 0) {
                this.entityMembers.push(member);
              }

              this.memberAddedEvent.emit(member?._id);

              resolve(this.utilityService.resolveAsyncPromise($localize`:@@editentitydialog.added:User added!`));
            }).catch((err) => {
              reject(this.utilityService.rejectAsyncPromise($localize`:@@editentitydialog.unableAdd:Unable to add the user to the entity, please try again!`));
            });
          }));
        }
      });
  }

  addAllMembers() {
    this.utilityService.getConfirmDialogAlert($localize`:@@editentitydialog.areYouSure:Are you sure?`, $localize`:@@editentitydialog.addAllToEntity:By doing this, the users will be added to the entity!`)
      .then((res) => {
        if (res.value) {
          this.utilityService.asyncNotification($localize`:@@editentitydialog.pleaseWaitAddMembers:Please wait we are adding all the members...`, new Promise((resolve, reject) => {
            this.hrService.addAllMemberToEntity(this.entityId, this.workspaceData?._id).then(res => {
              this.memberAddedEvent.emit();
              this.closeDialog();

              resolve(this.utilityService.resolveAsyncPromise($localize`:@@editentitydialog.usersAdded:Users added!`));
            }).catch((err) => {
              reject(this.utilityService.rejectAsyncPromise($localize`:@@editentitydialog.unableToAddMembers:Unable to add the users to the entity, please try again!`));
            });
          }));
        }
      }); 
  }

  closeDialog() {
    // Close the modal
    this.mdDialogRef.close();
  }

  isUserInEntity(memberId: string) {
    const index = (this.entityMembers) ? this.entityMembers.findIndex(v => v._id == memberId) : -1;
    return index >= 0;
  }
}
