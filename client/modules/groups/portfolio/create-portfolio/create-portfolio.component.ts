import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { GroupsService } from 'src/shared/services/groups-service/groups.service';
import { PortfolioService } from 'src/shared/services/portfolio-service/portfolio.service';

@Component({
  selector: 'app-create-portfolio',
  templateUrl: './create-portfolio.component.html',
  styleUrls: ['./create-portfolio.component.scss']
})
export class CreatePortfolioComponent implements OnInit {

  @Input() userData: any;

  @Output() portfolioEmitter = new EventEmitter();

  constructor(
    public utilityService: UtilityService,
    public portfolioService: PortfolioService
  ) { }

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
      inputPlaceholder: $localize`:@@createPortfolio.tryToAddShortName:Try to add a short name`,
      inputAttributes: {
        // maxlength: 20,
        autocapitalize: 'off',
        autocorrect: 'off'
      },
      imageUrl: imageUrl,
      imageAlt: title,
      confirmButtonText: title,
      showCancelButton: true,
      cancelButtonText: $localize`:@@createPortfolio.cancel:Cancel`,
      cancelButtonColor: '#d33',
    })
  }

  /**
   * This function creates the new normal group
   */
  async openCreatePortfolioModal() {
    const { value: value } = await this.openModal($localize`:@@createPortfolio.createPortfolio:Create Portfolio`, 'assets/images/create-group.svg');
    if (value) {
      this.utilityService.asyncNotification($localize`:@@createPortfolio.pleaseWaitWeCreatePortfolio:Please wait, while we are creating portfolio for you...`, new Promise((resolve, reject) => {
        this.createPortfolio(value)
          .then((group) => {

            // Emit the group object to the other components
            this.portfolioEmitter.emit(group);

            resolve(this.utilityService.resolveAsyncPromise($localize`:@@createPortfolio.portfolioCreated:Portfolio created!`))
          })
          .catch(() => reject(this.utilityService.rejectAsyncPromise($localize`:@@createPortfolio.unexpectedError:An unexpected error occurred while creating the portfolio, please try again!`)))
      }))
    } else if(value == ''){
      this.utilityService.warningNotification($localize`:@@createPortfolio.portfolioNameNotEmpty:Portfolio name can\'t be empty!`);
    }
  }

  /**
   * Create group helper function, which makes the HTTP request to create the group
   * @param portfolioName
   */
  createPortfolio(portfolioName: any){
    return new Promise((resolve, reject)=>{
      this.portfolioService.createPortfolio(portfolioName)
      .then((res)=> resolve(res['portfolio']))
      .catch(()=> reject({}))
    })
  }

}
