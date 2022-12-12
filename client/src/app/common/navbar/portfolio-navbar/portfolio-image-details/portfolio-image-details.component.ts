import { Component, OnInit, Input, Injector } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { PortfolioService } from 'src/shared/services/portfolio-service/portfolio.service';

@Component({
  selector: 'app-portfolio-image-details',
  templateUrl: './portfolio-image-details.component.html',
  styleUrls: ['./portfolio-image-details.component.scss']
})
export class PortfolioImageDetailsComponent implements OnInit {

  @Input() portfolioData: any;

  workspaceData;

  // Cropped Image of the Input Image File
  croppedImage: File;

  // Public Functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private injector: Injector,
    private utilityService: UtilityService,
    private portfolioService: PortfolioService
  ) { }

  async ngOnInit() {
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
  }

  /**
   * This function recieves the @Output from @module <app-crop-image></app-crop-image>
   * @param $event - as the cropped image File
   */
  getCroppedImage($event: File) {
    this.croppedImage = $event;
  }

  updateImage() {
    this.utilityService.asyncNotification($localize`:@@portfolioImageDetails.pleaseWaitWhileWeUpdate:Please wait while we are updating the portfolio avatar...`,
      new Promise((resolve, reject) => {
        this.portfolioService.updatePortfolioImage(this.portfolioData?._id, this.croppedImage, this.workspaceData._id)
          .then((res)=>{
            this.portfolioData.portfolio_avatar = res['portfolio']['portfolio_avatar'];
            this.publicFunctions.sendUpdatesToPortfolioData(this.portfolioData)
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@portfolioImageDetails.portfolioAvatarUpdated:Portfolio Avatar Updated!`))
          })
          .catch(()=>{
            reject(this.utilityService.rejectAsyncPromise($localize`:@@portfolioImageDetails.unableToUpdateAvatar:Unable to update the portfolio avatar!`))
          });
      }))
  }
}
