import { Component, OnInit, Injector, Input } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-delete-group',
  templateUrl: './delete-group.component.html',
  styleUrls: ['./delete-group.component.scss']
})
export class DeleteGroupComponent implements OnInit {

  constructor(
    private injector: Injector,
    public router: Router,
    private utilityService: UtilityService
  ) { }

  // groupId of the current group
  @Input('groupId') groupId: string

  // Router Object


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
          utilityService.asyncNotification('Please Wait while we are deleting the group',
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
                      resolve(utilityService.resolveAsyncPromise('Group removed!'));

                    });
                })
                .catch(() => {
                  // Reject the promise
                  reject(utilityService.rejectAsyncPromise('Unable to delete the group, please try again!'))
                });
            }));
        }
      });
  }

}
