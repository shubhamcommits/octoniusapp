import { Component, OnInit, Inject, Injector } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';

@Component({
  selector: 'app-time-tracking-categories-dialog',
  templateUrl: './time-tracking-categories-dialog.component.html',
  styleUrls: ['./time-tracking-categories-dialog.component.scss']
})
export class GroupTimeTrackingCategoriesDialogComponent implements OnInit {

  categories = [];

  showNewCategory = false;
  newCategoryName = '';

  groupData;

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    private groupService: GroupService,
    private injector: Injector,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog
  ) { }

  async ngOnInit() {
    this.groupData = this.data.groupData;

    await this.groupService.getTimeTrackingCategories(this.groupData._id).then((res) => {
      if (res['categories']) {
        this.categories = res['categories']
      }
    });

    this.categories.sort((cf1, cf2) => (cf1.name > cf2.name) ? 1 : -1);
  }

  onCloseDialog() {
  }

  async createCategory() {
    if (this.newCategoryName !== '') {
      // Find the index of the field to check if the same named field exist or not
      const index = this.categories.findIndex((f: any) => f.name.toLowerCase() === this.newCategoryName.toLowerCase());

      // If index is found, then throw error notification
      if (index !== -1) {
        this.utilityService.warningNotification($localize`:@@groupTimeTrackingCategoriesDialog.categoryAlreadyExist:Category already exist!`);
      } else {
        const newCategory = {
          name: this.newCategoryName
        };


        // Save the new field
        await this.groupService.saveNewTimeTrackingCategory(newCategory, this.groupData._id).then((res: any) => {
          const dbCategories = res.categories;
          const index = dbCategories.findIndex((f: any) => f.name === newCategory.name);
          if (index >= 0) {
            newCategory['_id'] = dbCategories[index]._id;
          }
          this.groupData.time_tracking_categories = res.categories;
          this.publicFunctions.sendUpdatesToGroupData(this.groupData);
        });

        this.categories.push(newCategory);

        this.showNewCategory = false;
        this.newCategoryName = '';
      }
    }
  }

  /**
   * Call function to delete a custom field
   * @param field
   */
  removeCategory(category) {

    // Ask User to remove this field or not
    this.utilityService.getConfirmDialogAlert()
      .then((result) => {
        if (result.value) {
          // Remove the file
          this.utilityService.asyncNotification($localize`:@@groupTimeTrackingCategoriesDialog.pleaseWaitDeletingCategory:Please wait we are deleting the category...`, new Promise((resolve, reject) => {
            const index = this.categories.findIndex((c: any) => c.name.toLowerCase() === category.name.toLowerCase());
            if (index !== -1) {
              // Remove the value
              this.groupService.removeTimeTrackingCategory(category._id, this.groupData._id)
                .then((res: any) => {
                  // Remove the field from the list
                  this.categories.splice(index, 1);

                  this.groupData.time_tracking_categories = res.categories;
                  this.publicFunctions.sendUpdatesToGroupData(this.groupData);

                  resolve(this.utilityService.resolveAsyncPromise($localize`:@@groupTimeTrackingCategoriesDialog.categoryDeleted:Category deleted!`));
                }).catch((err) => {
                  reject(this.utilityService.rejectAsyncPromise($localize`:@@groupTimeTrackingCategoriesDialog.unableToDeleteCategory:Unable to delete category, please try again!`));
                });
            }
          }));
        }
      });
  }

  titleCase(word: string) {
    if (!word) {
      return word;
    }
    return word[0].toUpperCase() + word.substr(1).toLowerCase();
  }
}
