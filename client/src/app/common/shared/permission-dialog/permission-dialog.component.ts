import { Component, OnInit, Inject, Injector, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-permission-dialog',
  templateUrl: './permission-dialog.component.html',
  styleUrls: ['./permission-dialog.component.scss']
})
export class PermissionDialogComponent implements OnInit {

  @Output() closeEvent = new EventEmitter();

  item: any;
  groupData: any;
  userData: any;
  type: string;

  permissionsList: any = [];

  editMode: boolean = false;

  permissionToEdit: any;

  groupId: any;

  // tag: string;
  //subSink = new SubSink();
  //members: any[];
  //ragTag: string;
  //membersLoaded = false;
  //addNewRag = false;
  //searchRagPlaceHolder= 'Add a member to permission';

  permissionRights = [
    { _id: 'view', title: 'View' },
    { _id: 'hide', title: 'Hide' },
    { _id: 'edit', title: 'Edit' }
  ];

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);
  constructor(
      private injector: Injector,
      private utilityService: UtilityService,
      @Inject(MAT_DIALOG_DATA) public data: any,
      private mdDialogRef: MatDialogRef<PermissionDialogComponent>
    ) {}

  ngOnInit(): void {
    this.item = this.data.item;
    this.groupData = this.data.groupData;
    this.userData = this.data.userData;
    this.type = this.data.type;

    this.permissionsList = this.item?.permissions;
    this.groupId = this.groupData?._id;
  }

  editPermission(permission: any) {
    this.permissionToEdit = permission;
    this.editMode = true;
  }

  addNewPermission() {
    this.permissionToEdit = {
      right: '',
      rags: [],
      _members: []
    };

    this.editMode = true;
  }

  save() {
    this.editMode = false;
    this.permissionToEdit = null;
  }

  selectPermissionRight(permissionId: string, right: string) {
    // Change right to the Permission
    this.utilityService.asyncNotification($localize`:@@permissionDialog.pleaseWaitChangingPermissionRight:Please wait we are updating the right of the permission...`,
      new Promise((resolve, reject)=>{
        this.publicFunctions.selectPermissionRight(permissionId, this.item?._id, right, this.type)
          .then(async (res: any)=> {
            if (res['permissionId']) {
              this.permissionToEdit._id = res['permissionId'];
            }
            this.permissionToEdit.right = right;

            await this.updatePermissionInList(this.permissionToEdit);

            this.item.permissions = this.permissionsList;

            resolve(this.utilityService.resolveAsyncPromise($localize`:@@permissionDialog.permissionUpdated:Permission updated!`));
          })
          .catch((err) => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@permissionDialog.unableToUpdatePermission:Unable to update your permission`))
          });
      }));
  }

  removePermission(permissionId: string) {

    this.utilityService.getConfirmDialogAlert($localize`:@@permissionDialog.areYouSure:Are you sure?`, $localize`:@@permissionDialog.permissionCompletelyRemoved:By doing this, the permission will be completely removed!`)
      .then((res) => {
        if (res.value) {
          // Change right to the Permission
          this.utilityService.asyncNotification($localize`:@@permissionDialog.pleaseWaitDeletingPermissionRight:Please wait we are deleting the permission...`,
          new Promise((resolve, reject)=>{
            this.publicFunctions.removePermission(permissionId, this.item?._id, this.type)
              .then((res: any) => {
                // Find the index to check if the same name exist or not
                let indexPermission = this.permissionsList.findIndex(per => per._id == permissionId);
                // Remove the column from the array
                if (indexPermission >= 0) {
                  this.permissionsList.splice(indexPermission, 1);
                }

                this.item.permissions = this.permissionsList;
                resolve(this.utilityService.resolveAsyncPromise($localize`:@@permissionDialog.permissionDeleted:Permission deleted!`));
              })
              .catch((err) => {
                console.log(err);
                reject(this.utilityService.rejectAsyncPromise($localize`:@@permissionDialog.unableToDeletePermission:Unable to delete your permission`))
              });
          }));
        }
      });
  }

  async addTagToPermission(permissionId: string, tag: any) {
    await this.utilityService.asyncNotification($localize`:@@permissionDialog.plesaeWaitWeAreUpdaing:Please wait we are updating the content...`, new Promise((resolve, reject) => {
      this.publicFunctions.addTagToPermission(permissionId, this.item?._id, tag, this.type)
        .then(async (res) => {
          let ragIndex = this.permissionToEdit.rags.findIndex(rag => rag == tag);
          if (ragIndex < 0) {
            this.permissionToEdit.rags.push(tag);
          }

          await this.updatePermissionInList(this.permissionToEdit);

          this.item.permissions = this.permissionsList;

          resolve(this.utilityService.resolveAsyncPromise($localize`:@@permissionDialog.detailsUpdated:Details updated!`));
        })
        .catch((err) => {
          console.log(err);
          reject(this.utilityService.rejectAsyncPromise($localize`:@@permissionDialog.unableToUpdateDetails:Unable to update the details, please try again!`));
        });
    }));
  }

  async removePermissionTag(permissionId: string, tag: string) {
    await this.utilityService.asyncNotification($localize`:@@permissionDialog.plesaeWaitWeAreUpdaing:Please wait we are updating the content...`, new Promise((resolve, reject) => {
      this.publicFunctions.removePermissionTag(permissionId, this.item?._id, tag, this.type)
        .then(async (res) => {
          let ragIndex = this.permissionToEdit.rags.findIndex(rag => rag == tag);
          if (ragIndex >= 0) {
            this.permissionToEdit.rags.splice(ragIndex, 1);
          }

          await this.updatePermissionInList(this.permissionToEdit);

          this.item.permissions = this.permissionsList;

          resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupCreatePostDialog.detailsUpdated:Details updated!`));
        })
        .catch((err) => {
          console.log(err);
          reject(this.utilityService.rejectAsyncPromise($localize`:@@groupCreatePostDialog.unableToUpdateDetails:Unable to update the details, please try again!`));
        });
    }));
  }

  addNewUserToPermission(event: any, permissionId: string) {
    // Add a new member to rag
    this.utilityService.asyncNotification($localize`:@@permissionDialog.pleaseWaitAddingNewUserToPermission:Please wait we are adding the new user to permission...`,
      new Promise((resolve, reject) => {
        this.publicFunctions.addMemberToPermission(this.item?._id, permissionId, event, this.type)
          .then(async (res: any)=> {
            let memberIndex = this.permissionToEdit._members.findIndex(member => member._id == (event._id || event));
            if (memberIndex < 0) {
              this.permissionToEdit._members.push(res['member']);
            }

            await this.updatePermissionInList(this.permissionToEdit);

            this.item.permissions = this.permissionsList;
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@permissionDialog.addedToPermission:${event.first_name} added to your permission!`));
          })
          .catch((err) => {
            console.log(err);
            reject(this.utilityService.rejectAsyncPromise($localize`:@@permissionDialog.unableToAddToRag:Unable to add ${event.first_name} to your permission`))
          });
      }));
  }

  removeMemberFromPermission(member: any, permissionId: string) {
    // Add a new member to rag
    this.utilityService.asyncNotification($localize`:@@permissionDialog.pleaseWaitRemoveMemberFromPermission:Please wait we are removing the member from permission...`,
      new Promise((resolve, reject) => {
        this.publicFunctions.removeMemberFromPermission(this.item?._id, permissionId, (member?._id || member), this.type)
          .then(async (res: any)=> {
            let memberIndex = this.permissionToEdit._members.findIndex(memb => (memb._id || memb) == (member?._id || member));
            if (memberIndex >= 0) {
              this.permissionToEdit._members.splice(memberIndex, 1);
            }

            await this.updatePermissionInList(this.permissionToEdit);

            this.item.permissions = this.permissionsList;
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@permissionDialog.removedFromPermission:${member?.first_name} removed from permission!`));
          })
          .catch((err) => {
            console.log(err);
            reject(this.utilityService.rejectAsyncPromise($localize`:@@permissionDialog.unableToRemoveFromPermission:Unable to remove ${member?.first_name} from permission`));
          });
      }));
  }

  updatePermissionInList(permission: any) {
    if (!this.permissionsList) {
      this.permissionsList = [];
    }
    const permissionIndex = this.permissionsList.findIndex(pers => pers?._id == permission?._id);
    if (permissionIndex >= 0) {
      this.permissionsList[permissionIndex] = permission;
    } else {
      this.permissionsList.push(permission)
    }
  }

  onCloseDialog() {
    this.closeEvent.emit(this.item);
  }
}
