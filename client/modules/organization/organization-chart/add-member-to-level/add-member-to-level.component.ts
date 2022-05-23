import { Component, OnInit, Injector, Input, Output, EventEmitter, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { UserService } from 'src/shared/services/user-service/user.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-add-member-to-level',
  templateUrl: './add-member-to-level.component.html',
  styleUrls: ['./add-member-to-level.component.scss']
})
export class AddMemberToLevelComponent implements OnInit {

  @Output() memberAddedEmitter = new EventEmitter();

  managerId;
  members = [];

  selectedMember;

  workspaceData;

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  // Utility Service
  public utilityService = this.injector.get(UtilityService);

  // Subsink to add subscriptions to this array
  public subSink = new SubSink();

  constructor(
    private userService: UserService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private mdDialogRef: MatDialogRef<AddMemberToLevelComponent>,
    private injector: Injector
  ) { }

  async ngOnInit() {

    this.managerId = this.data.managerId;
    this.members = this.data.members;

    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
  }

  ngOnDestroy() {

  }

  selectMember(event) {
    let member = event.value;
    this.utilityService.asyncNotification($localize`:@@addMemberToLevel.pleaseWaitsavingSettings:Please wait, we are saving the new setting...`,
    new Promise((resolve, reject)=>{
      this.userService.saveCustomField(member._id, this.workspaceData?.manager_custom_field, this.managerId)
        .then(()=> {
          member.nextLevelMembers = [];
          this.memberAddedEmitter.emit(member);
          this.closeDialog();
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@addMemberToLevel.settingsSaved:Settings saved!`));
        })
        .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@addMemberToLevel.unableToSaveGroupSettings:Unable to save the settings, please try again!`)));
    }));
  }

  closeDialog() {
    this.mdDialogRef.close();
  }
}
