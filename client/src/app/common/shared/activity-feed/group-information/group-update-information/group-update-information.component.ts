import { Component, Injector, Input, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-group-update-information',
  templateUrl: './group-update-information.component.html',
  styleUrls: ['./group-update-information.component.scss']
})
export class GroupUpdateInformationComponent implements OnInit {

  @Input() groupData;

  titlePlaceholder = $localize`:@@groupUpdateInformation.updateGroupInformation:Update Group Information`;
  groupNamePlaceholder = $localize`:@@groupUpdateInformation.groupName:Group Name!`;
  groupDescriptionPlaceholder = $localize`:@@groupUpdateInformation.groupDescription:Group Description!`;
  groupTypePlaceholder = $localize`:@@groupUpdateInformation.groupType:Group Type!`;
  groupTypeNormal = $localize`:@@groupUpdateInformation.groupTypeNormal:Normal`;
  groupTypeAgora = $localize`:@@groupUpdateInformation.groupTypeAgora:Agora`;
  groupTypeCRM = $localize`:@@groupUpdateInformation.groupTypeCRM:CRM`;
  groupTypeResource = $localize`:@@groupUpdateInformation.groupTypeResource:Resource`;

  private publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    private groupService: GroupService,
    private injector: Injector
  ) { }

  ngOnInit() {
  }

  async editGroupDetails() {
    const newGroupData = {
      type: this.groupData.type,
      description: this.groupData.description,
      group_name: this.groupData.group_name
    };

    if (this.utilityService.objectExists(newGroupData)) {
      this.utilityService.asyncNotification($localize`:@@groupUpdateInformation.pleaseWaitWeUpdateGroupInformation:Please wait we are updating the group\'s information...`,
        new Promise((resolve, reject) => {
          this.groupService.updateGroup(this.groupData._id, newGroupData)
            .then((res) => {
              // Send Updates to the group data service
              this.publicFunctions.sendUpdatesToGroupData(this.groupData);

              this.utilityService.handleDeleteGroupFavorite().emit(true);
              this.utilityService.handleUpdateGroupData().emit(true);
              // Resolve with success
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupUpdateInformation.groupUpdatedSucessfully:Group updated sucessfully!`))
            })
            .catch(() =>
              reject(this.utilityService.rejectAsyncPromise($localize`:@@groupUpdateInformation.unexpectedError:An unexpected error occurred while updating the group, please try again!`)))
        }))
    } else {
      this.utilityService.warningNotification($localize`:@@groupUpdateInformation.kindlyFillUp:Kindly fill up all the details properly!`);
    }
  }

  closeModal() {
    this.utilityService.closeAllModals();
  }
}
