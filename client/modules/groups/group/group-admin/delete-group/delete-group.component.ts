import { Component, OnInit, Injector, Input } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';

@Component({
  selector: 'app-delete-group',
  templateUrl: './delete-group.component.html',
  styleUrls: ['./delete-group.component.scss']
})
export class DeleteGroupComponent implements OnInit {

  // groupId of the current group
  @Input() groupId: string;
  @Input() numMembers: number;

  // Public Functions Instancr
  publicFunctions = this.injector.get(PublicFunctions);

  constructor(
    private injector: Injector,
    public router: Router,
    private utilityService: UtilityService
  ) { }

  ngOnInit() {
  }

  /**
   * This function is responsible for removing the group from the database
   * @param groupId
   * @param router
   */
  deleteGroup(groupId: string) {

    // Group Service Instance
    let groupService = this.injector.get(GroupService);

    // Utility Service Instancr
    let utilityService = this.injector.get(UtilityService);

    // Ask User to delete the group or not
    utilityService.getConfirmDialogAlert()
      .then((result) => {
        if (result.value) {

          // Delete the group from the workspace
          utilityService.asyncNotification($localize`:@@deleteGroup.pleaseWaitDeletingGroup:Please Wait while we are deleting the group`,
            new Promise((resolve, reject) => {
              // Call Remove Group Service Function
              groupService.removeGroup(groupId)
                .then(() => {
                  // Redirect the user to groups page
                  this.router.navigate(['/dashboard', 'work', 'groups', 'all'])
                    .then(() => {
                      // Resolve the async promise
                      this.utilityService.handleDeleteGroupFavorite().emit(true);
                      this.utilityService.handleUpdateGroupData().emit(true);
                      resolve(utilityService.resolveAsyncPromise($localize`:@@deleteGroup.groupRemoved:Group removed!`));

                    });
                })
                .catch(() => {
                  // Reject the promise
                  reject(utilityService.rejectAsyncPromise($localize`:@@deleteGroup.unableToDeleteGroup:Unable to delete the group, please try again!`))
                });
            }));
        }
      });
  }

  archiveGroup(groupId: string) {

    // Group Service Instance
    let groupService = this.injector.get(GroupService);

    // Utility Service Instancr
    let utilityService = this.injector.get(UtilityService);

    // Ask User to delete the group or not
    utilityService.getConfirmDialogAlert($localize`:@@deleteGroup.areYouSure:Are you sure?`, $localize`:@@deleteGroup.thisActionWillArchiveGroup:This action will archive the group.`)
      .then((result) => {
        if (result.value) {

          // Delete the group from the workspace
          utilityService.asyncNotification($localize`:@@deleteGroup.pleaseWaitArchivingGroup:Please Wait while we are archive the group`,
            new Promise((resolve, reject) => {
              // Call Archive Group Service Function
              groupService.archiveGroup(groupId, true)
                .then(async () => {
                  // Redirect the user to groups page
                  this.router.navigate(['/dashboard', 'work', 'groups', 'all'])
                    .then(() => {
                      // Resolve the async promise
                      resolve(utilityService.resolveAsyncPromise($localize`:@@deleteGroup.groupArchived:Group archived!`));
                      // refresh page in order to update the sidebar groups in case this was a favorite group
                      location.reload();
                    });
                })
                .catch(() => {
                  // Reject the promise
                  reject(utilityService.rejectAsyncPromise($localize`:@@deleteGroup.unableToArchiveGroup:Unable to archive the group, please try again!`))
                });
            }));
        }
      });
  }

}
