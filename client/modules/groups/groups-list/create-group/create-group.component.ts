import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { GroupsService } from 'src/shared/services/groups-service/groups.service';

@Component({
  selector: 'app-create-group',
  templateUrl: './create-group.component.html',
  styleUrls: ['./create-group.component.scss']
})
export class CreateGroupComponent implements OnInit {

  constructor(
    public utilityService: UtilityService,
    public groupsService: GroupsService
  ) { }

  // User Data Object
  @Input('userData') userData: any;

  // Workspace Data Object
  @Input('workspaceData') workspaceData: any = {};

  // Group Emitter which emits the group object on creation
  @Output('group') groupEmitter = new EventEmitter();

  ngOnInit() {
  }

  /**
   * This function opens the Swal modal to create normal, agora and smart groups
   * @param title
   * @param imageUrl
   */
  openModal(title: string, imageUrl: string){
    return this.utilityService.getSwalModal({
      title: title,
      input: 'text',
      inputPlaceholder: 'Try to add a short name',
      inputAttributes: {
        maxlength: 20,
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      imageUrl: imageUrl,
      imageAlt: title,
      confirmButtonText: title,
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      cancelButtonColor: '#d33',
    })
  }

  /**
   * This function creates the new normal group
   */
  async openCreateGroupModal() {
    const { value: value } = await this.openModal('Create Group', 'assets/images/create-group.svg');
    if (value) {
      this.utilityService.asyncNotification('Please wait, while we are creating group for you...', new Promise((resolve, reject) => {
        this.createGroup(value, this.workspaceData['workspace_name'], this.workspaceData['_id'], this.userData['_id'], 'normal')
          .then((group) => {

            // Emit the group object to the other components
            this.groupEmitter.emit(group);

            resolve(this.utilityService.resolveAsyncPromise('Group created!'))
          })
          .catch(() => reject(this.utilityService.rejectAsyncPromise('An unexpected error occured while creating the group, please try again!')))
      }))
    } else if(value == ''){
      this.utilityService.warningNotification('Group name can\'t be empty!');
    }
  }

  /**
   * This function creates the new agora group
   */
  async openCreateAgoraModal(){
    const { value: value } = await this.openModal('Create Agora', 'assets/images/create-agora.svg');
    if(value){
      this.utilityService.asyncNotification('Please wait, while we are creating agora for you...', new Promise((resolve, reject) => {
        this.createGroup(value, this.workspaceData['workspace_name'], this.workspaceData['_id'], this.userData['_id'], 'agora')
          .then((group) => {

            // Emit the group object to the other components
            this.groupEmitter.emit(group);

            resolve(this.utilityService.resolveAsyncPromise('Agora created!'))
          })
          .catch(() => reject(this.utilityService.rejectAsyncPromise('An unexpected error occured while creating the group, please try again!')))
      }))

    } else if(value == ''){
      this.utilityService.warningNotification('Agora name can\'t be empty!')
    }
  }

  /**
   * This function creates the new smart group
   */
  /*
  async openCreateSmartGroupModal(){
    const { value: value } = await this.openModal('Create Smart Group', 'assets/images/create-smartgroup.svg');
    if(value){
      this.utilityService.asyncNotification('Please wait, while we are creating smart group for you...', new Promise((resolve, reject) => {
        this.createGroup(value, this.workspaceData['workspace_name'], this.workspaceData['_id'], this.userData['_id'], 'smart')
          .then((group) => {

            // Emit the group object to the other components
            this.groupEmitter.emit(group);

            resolve(this.utilityService.resolveAsyncPromise('Smart Group created!'))
          })
          .catch(() => reject(this.utilityService.rejectAsyncPromise('An unexpected occured while creating the group, please try again!')))
      }))
    } else if(value == ''){
      this.utilityService.warningNotification('Smart Group name can\'t be empty!')
    }
  }
  */

  /**
   * Create group helper function, which makes the HTTP request to create the group
   * @param groupName
   * @param workspaceName
   * @param workspaceId
   * @param userId
   * @param type
   */
  createGroup(groupName: any, workspaceName: any, workspaceId: any, userId: any, type: any){
    return new Promise((resolve, reject)=>{
      this.groupsService.createGroup(groupName, workspaceName, workspaceId, userId, type)
      .then((res)=> resolve(res['group']))
      .catch(()=> reject({}))
    })
  }

}
