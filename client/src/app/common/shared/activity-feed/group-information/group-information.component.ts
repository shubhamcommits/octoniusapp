import { Component, OnInit, Input, Injector } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { PublicFunctions } from 'modules/public.functions';

@Component({
  selector: 'app-group-information',
  templateUrl: './group-information.component.html',
  styleUrls: ['./group-information.component.scss']
})
export class GroupInformationComponent implements OnInit {

  constructor(
    private utilityService: UtilityService,
    private groupService: GroupService,
    private injector: Injector
  ) { }

  // Group Data Variable
  @Input('groupData') groupData: any;

  // User Data Variable
  @Input('userData') userData: any;

  // My workplace variable check
  @Input('myWorkplace') myWorkplace = false;

  // PUBLIC FUNCTIONS
  private publicFunctions = new PublicFunctions(this.injector);

  async ngOnInit() {
    if (!this.utilityService.objectExists(this.groupData)) {
      this.groupData = await this.publicFunctions.getCurrentGroupDetails();
    }
  }

  /**
   * This function is responsible for editing the group details
   */
  // async editGroupDetails(openModal) {

  //   // Open Model Function, which opens up the modal
  //   const { value: value } = await openModal;
  //   if (value) {
  //     value.type = (!value.type || value.type == '') ? this.groupData.type : value.type;

  //     this.utilityService.asyncNotification($localize`:@@groupInformation.pleaseWaitWeUpdateGroupInformation:Please wait we are updating the group\'s information...`,
  //       new Promise((resolve, reject) => {
  //         this.groupService.updateGroup(this.groupData._id, value)
  //           .then((res) => {

  //             // Update the Data
  //             this.groupData.description = value.description;
  //             this.groupData.group_name = value.group_name;
  //             this.groupData.type = value.type;

  //             // Send Updates to the group data service
  //             this.publicFunctions.sendUpdatesToGroupData(this.groupData);

  //             this.utilityService.handleDeleteGroupFavorite().emit(true);
  //             this.utilityService.handleUpdateGroupData().emit(true);
  //             // Resolve with success
  //             resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupInformation.groupUpdatedSucessfully:Group updated sucessfully!`))
  //           })
  //           .catch(() =>
  //             reject(this.utilityService.rejectAsyncPromise($localize`:@@groupInformation.unexpectedError:An unexpected error occurred while updating the group, please try again!`)))
  //       }))
  //   } else if (JSON.stringify(value) == '') {
  //     this.utilityService.warningNotification($localize`:@@groupInformation.kindlyFillUp:Kindly fill up all the details properly!`);
  //   }
  // }

  /**
   * This function opens the Swal modal to edit the group details
   * @param title
   *  @param imageUrl
   */
  openModal(content/*title: string, imageUrl: string*/) {
    this.utilityService.openModal(content, {
      disableClose: true,
      hasBackdrop: true
    });
    // const groupNamePlaceholder = $localize`:@@groupInformation.groupName:Group Name!`;
    // const groupDescriptionPlaceholder = $localize`:@@groupInformation.groupDescription:Group Description!`;
    // const groupTypePlaceholder = $localize`:@@groupInformation.groupType:Group Type!`;
    // const groupTypeNormal = $localize`:@@groupInformation.groupTypeNormal:Normal`;
    // const groupTypeAgora = $localize`:@@groupInformation.groupTypeAgora:Agora`;
    // const groupTypeCRM = $localize`:@@groupInformation.groupTypeCRM:CRM`;
    // const groupTypeResource = $localize`:@@groupInformation.groupTypeResource:Resource`;
    // const groupTypeAccounting = $localize`:@@groupInformation.groupTypeAccounting:Accounting`;

    // // Swal modal for update details
    // return this.utilityService.getSwalModal({
    //   title: 'Update Group Information!',
    //   html:
    //     `<input id="group-name" type="text" placeholder="${groupNamePlaceholder}"
    //       value="${this.groupData.group_name || 'Your Group Name here...'}" class="swal2-input">` +
    //     `<input id="group-description" type="text" placeholder="${groupDescriptionPlaceholder}"
    //       value="${this.groupData.description || ''}" class="swal2-input">` +
    //     `<select id="group-type" value="${this.groupData.type}" placeholder="${groupTypePlaceholder}" class="swal2-input">
    //         <option value="" selected disabled>Choose an option</option>
    //         <option value="normal">${groupTypeNormal}</option>
    //         <option value="agora">${groupTypeAgora}</option>
    //         <option value="crm">${groupTypeCRM}</option>
    //         <option value="resource">${groupTypeResource}</option>
    //       </select>`,
    //         // <option value="accounting">${groupTypeAccounting}</option>
            
    //   focusConfirm: false,
    //   preConfirm: () => {
    //     // Return Object to passed in the req.body
    //     return {
    //       group_name: document.getElementById('group-name')['value'],
    //       description: document.getElementById('group-description')['value'],
    //       type: document.getElementById('group-type')['value'],
    //     }
    //   },
    //   confirmButtonText: $localize`:@@groupInformation.updateInformation:Update Information!`,
    //   showCancelButton: true,
    //   cancelButtonText: 'Cancel',
    //   cancelButtonColor: '#d33',
    //   scrollbarPadding: true,
    //   imageUrl: 'assets/images/user-professional-info.svg',
    //   imageAlt: 'Update Group Information!',
    //   customClass: {
    //     content: 'content-class',
    //     container: 'container-class',
    //   }
    // })
  }

/**
 * This function is responsible for returning the unique group members count
 * @param members
 * @param admins
 * @returns
 */
  getUniqueMembersCount(members, admins) {

    if (members.length >= 0 && admins.length >= 0) {
      // Merge the Admin and Members array
      Array.prototype.push.apply(members, admins)

      // Set the value of members and remove the duplicates
      members = Array.from(new Set(members))

      return members.length
    }
    else
      return 0

  }

}
