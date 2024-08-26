import { Component, OnInit, Input, Injector } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PublicFunctions } from 'modules/public.functions';
import { CRMService } from 'src/shared/services/crm-service/crm.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-crm-company-image-dialog',
  templateUrl: './crm-company-image-dialog.component.html',
  styleUrls: ['./crm-company-image-dialog.component.scss']
})
export class CRMCompanyImageDialogComponent implements OnInit {
  
  @Input() companyData: any;
  
  workspaceData;

  // Cropped Image of the Input Image File
  croppedImage: File;
  
  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector);
  
  constructor(
    private dialogRef: MatDialogRef<CRMCompanyImageDialogComponent>,
    private injector: Injector,
    private utilityService: UtilityService
  ) { }

  async ngOnInit() {
		if (!this.utilityService.objectExists(this.workspaceData)) {
			this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
		}
  }

  /**
   * This function recieves the @Output from @module <app-crop-image></app-crop-image>
   * @param $event - as the cropped image File
   */
  getCroppedImage($event: File) {
    this.croppedImage = $event;
  }

  updateImage() {

    // Group Service Instance
    // let groupService = this.injector.get(GroupService);
    let crmService = this.injector.get(CRMService);
    let utilityService = this.injector.get(UtilityService);

    utilityService.asyncNotification($localize`:@@crmCompanyImageDialog.pleaseWaitWhileWeUpdate:Please wait while we are updating the company image...`,
      new Promise((resolve, reject) => {

        // groupService.updateGroupImage(this.groupData._id, this.croppedImage, (this.groupData._workspace._id || this.groupData._workspace))
        //   .then((res)=>{
        //     this.groupData.group_avatar = res['group']['group_avatar'];

        //     this.publicFunctions.sendUpdatesToGroupData(this.groupData)

        //     resolve(utilityService.resolveAsyncPromise($localize`:@@crmCompanyImageDialog.groupAvatarUpdated:Group Avatar Updated!`))
        //   })
        //   .catch(()=>{
        //     reject(utilityService.rejectAsyncPromise($localize`:@@crmCompanyImageDialog.unableToUpdateAvatar:Unable to update the group avatar!`))
        //   });
        crmService.updateCRMCompany(this.companyData, this.croppedImage)
          .then((res)=>{
            this.companyData.company_pic = res['company']['company_pic'];
            resolve(utilityService.resolveAsyncPromise($localize`:@@crmCompanyImageDialog.companyImageUpdated:Company Image Updated!`))
            this.dialogRef.close();
          })
          .catch(()=>{
            reject(utilityService.rejectAsyncPromise($localize`:@@crmCompanyImageDialog.unableToUpdateImage:Unable to update the company image!`))
          });

      }))
  }
}
