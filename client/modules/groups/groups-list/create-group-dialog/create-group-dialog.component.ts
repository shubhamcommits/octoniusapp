import { Component, OnInit, Input, Output, EventEmitter, Inject, Injector } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { GroupsService } from 'src/shared/services/groups-service/groups.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';

@Component({
  selector: 'app-create-group-dialog',
  templateUrl: './create-group-dialog.component.html',
  styleUrls: ['./create-group-dialog.component.scss']
})
export class CreateGroupDialogComponent implements OnInit {

  // Group Emitter which emits the group object on creation
  @Output() groupEmitter = new EventEmitter();

  userData: any;
  workspaceData: any = {};

  groupName = '';
  groupType = '';

  inputPlaceholder = $localize`:@@createGroupDialog.groupName:Group Name`;
  
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    public groupsService: GroupsService,
    public injector: Injector,
    private mdDialogRef: MatDialogRef<CreateGroupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  async ngOnInit() {

    // Fetch the current loggedIn user data
    if (!this.utilityService.objectExists(this.userData)) {
      this.userData = await this.publicFunctions.getCurrentUser();
    }

    if (!this.utilityService.objectExists(this.workspaceData)) {
      // Fetch the current workspace data
      this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    }
  }

  // /**
  //  * This function opens the Swal modal to create normal, agora and smart groups
  //  * @param title
  //  * @param imageUrl
  //  */
  // openModal(title: string, imageUrl: string){
  //   return this.utilityService.getSwalModal({
  //     title: title,
  //     input: 'text',
  //     inputPlaceholder: $localize`:@@createGroupDialog.tryToAddShortName:Try to add a short name`,
  //     inputAttributes: {
  //       // maxlength: 20,
  //       autocapitalize: 'off',
  //       autocorrect: 'off'
  //     },
  //     imageUrl: imageUrl,
  //     imageAlt: title,
  //     confirmButtonText: title,
  //     showCancelButton: true,
  //     cancelButtonText: $localize`:@@createGroupDialog.cancel:Cancel`,
  //     cancelButtonColor: '#d33',
  //   })
  // }

  // /**
  //  * This function creates the new normal group
  //  */
  // async openCreateGroupModal(type: string) {
  //   const { value: value } = await this.openModal($localize`:@@createGroupDialog.createGroup:Create Group`, 'assets/images/create-group.svg');
  //   if (value) {
  //     this.utilityService.asyncNotification($localize`:@@createGroupDialog.pleaseWaitWeCreateGroup:Please wait, while we are creating group for you...`, new Promise((resolve, reject) => {
  //       this.createGroup(value, this.workspaceData['workspace_name'], this.workspaceData['_id'], this.userData['_id'], type)
  //         .then((group) => {

  //           // Emit the group object to the other components
  //           this.groupEmitter.emit(group);

  //           resolve(this.utilityService.resolveAsyncPromise($localize`:@@createGroupDialog.groupCreated:Group created!`))
  //         })
  //         .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@createGroupDialog.unexpectedErrorCreatingGroup:An unexpected error occurred while creating the group, please try again!`)))
  //     }))
  //   } else if(value == ''){
  //     this.utilityService.warningNotification($localize`:@@createGroupDialog.groupNameNotEmpty:Group name can\'t be empty!`);
  //   }
  // }

  // /**
  //  * This function creates the new agora group
  //  */
  // async openCreateAgoraModal(){
  //   const { value: value } = await this.openModal($localize`:@@createGroupDialog.createAgora:Create Agora`, 'assets/images/create-agora.svg');
  //   if(value){
  //     this.utilityService.asyncNotification($localize`:@@createGroupDialog.pleaseWaitWeCreateAgora:Please wait, while we are creating agora for you...`, new Promise((resolve, reject) => {
  //       this.createGroup(value, this.workspaceData['workspace_name'], this.workspaceData['_id'], this.userData['_id'], 'agora')
  //         .then((group) => {

  //           // Emit the group object to the other components
  //           this.groupEmitter.emit(group);

  //           resolve(this.utilityService.resolveAsyncPromise($localize`:@@createGroupDialog.agoraCreated:Agora created!`))
  //         })
  //         .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@createGroupDialog.unexpectedErrorCreatingGroup:An unexpected error occurred while creating the group, please try again!`)))
  //     }))

  //   } else if(value == ''){
  //     this.utilityService.warningNotification($localize`:@@createGroupDialog.agoraNameNotEmpty:Agora name can\'t be empty!`)
  //   }
  // }

  /**
   * Create group helper function, which makes the HTTP request to create the group
   */
  createGroup() {
    this.utilityService.asyncNotification($localize`:@@createGroupDialog.pleaseWaitWeCreateGroup:Please wait, while we are creating the group for you...`, new Promise((resolve, reject) => {
      this.groupsService.createGroup(this.groupName, this.workspaceData?.workspace_name, this.workspaceData?._id, this.userData?._id, this.groupType)
        .then((res)=> {
          this.groupEmitter.emit(res['group']);
          this.closeDialog();
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@createGroupDialog.groupCreated:Group created!`))
        })
        .catch(()=> reject(this.utilityService.rejectAsyncPromise($localize`:@@createGroupDialog.unexpectedErrorCreatingGroup:An unexpected error occurred while creating the group, please try again!`)));
      }));
  }

  closeDialog() {
    this.mdDialogRef.close();
  }

}
