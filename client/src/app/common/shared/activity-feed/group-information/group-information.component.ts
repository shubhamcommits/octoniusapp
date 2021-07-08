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

  ngOnInit() {
  }

  /**
   * This function is responsible for editing the group details
   */
  async editGroupDetails(openModal) {

    // Open Model Function, which opens up the modal
    const { value: value } = await openModal;
    if (value) {
      this.utilityService.asyncNotification('Please wait we are updating the group\'s information...',
        new Promise((resolve, reject) => {
          this.groupService.updateGroup(this.groupData._id, value)
            .then((res) => {

                // Update the Data
                this.groupData.description = value.description;
                this.groupData.group_name = value.group_name

                // Send Updates to the group data service
                this.publicFunctions.sendUpdatesToGroupData(this.groupData);
                
                this.utilityService.handleDeleteGroupFavorite().emit(true);
                this.utilityService.handleUpdateGroupData().emit(true);
                // Resolve with success
                resolve(this.utilityService.resolveAsyncPromise('Group updated sucessfully!'))
            })
            .catch(() =>
              reject(this.utilityService.rejectAsyncPromise('An unexpected occured while updating the group, please try again!')))
        }))
    } else if (JSON.stringify(value) == '') {
      this.utilityService.warningNotification('Kindly fill up all the details properly!');
    }
  }

  /**
   * This function opens the Swal modal to edit the group details
   * @param title
   *  @param imageUrl
   */
  openModal(title: string, imageUrl: string) {

    // Swal modal for update details
    return this.utilityService.getSwalModal({
      title: title,
      html:
        `<input id="phone-number" type="text" placeholder="Group Name"
    value="${this.groupData.group_name || 'Your Group Name here...'}" class="swal2-input">` +

        `<input id="mobile-number" type="text" placeholder="Group Description"
    value="${this.groupData.description || ''}" class="swal2-input">`,

      focusConfirm: false,
      preConfirm: () => {

        // Return Object to passed in the req.body
        return {
          group_name: document.getElementById('phone-number')['value'],
          description: document.getElementById('mobile-number')['value'],
        }
      },
      confirmButtonText: 'Update Information!',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      cancelButtonColor: '#d33',
      scrollbarPadding: true,
      imageUrl: imageUrl,
      imageAlt: title,
      customClass: {
        content: 'content-class',
        container: 'container-class',
      }
    })
  }

  /**
   * This function is responsible for returning the unique group members count
   * @param members 
   * @param admins 
   * @returns 
   */
     getUniqueMembersCount(members, admins) {

      if (members.length > 0 && admins.length > 0) {
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
