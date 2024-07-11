import { Component, Injector, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { PricingTableComponent } from 'src/app/common/shared/pricing-table/pricing-table.component';
import { AuthService } from 'src/shared/services/auth-service/auth.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-new-workplace',
  templateUrl: './auth-new-workplace.component.html',
  styleUrls: ['./auth-new-workplace.component.scss']
})
export class AuthNewWorkplaceComponent implements OnInit {

  @ViewChild("pricingTableDialog") pricingTableDialog: TemplateRef<any>;

  // Defining User Object, which accepts the following properties
  workplace: { name: string, company_name: string, stripe_product_id: string } = {
    name: null,
    company_name: null,
    stripe_product_id: null
  };

  accountData;
  validWorkspace = false;

  stripeProducts = [];

  publicFunctions = new PublicFunctions(this._Injector);

  constructor(
    public utilityService: UtilityService,
    private authenticationService: AuthService,
    private storageService: StorageService,
    public router: Router,
    public dialog: MatDialog,
    private _Injector: Injector
  ) { }

  async ngOnInit() {
    this.accountData = await this.publicFunctions.getAccountDetailsFromStorage();
    if (!this.accountData || JSON.stringify(this.accountData) == JSON.stringify({})) {
      this.router.navigate(['']);
    }
    await this.getSubscriptionProducts();
  }

  async getSubscriptionProducts() {
    await this.authenticationService.getSubscriptionProducts()
      .then((res: any) => {
        this.stripeProducts = res.products.products;
      });
  }

  checkWorkspaceAvailability() {
    if (this.workplace.name == null || this.workplace.name == '') {
      this.utilityService.warningNotification($localize`:@@authNewWorkplace.nameCannotBeEmpty:Workplace name can\'t be empty!`);
      this.validWorkspace = false;
    } else {
      // this.authenticationService.checkWorkspaceName({
      //     workspace_name: this.workplace.name
      //   })
      //   .then(() => {
      //     this.validWorkspace = true;
      //     this.utilityService.successNotification($localize`:@@authNewWorkplace.nameAvailable:This workplace name is available.`);
      //   })
      //   .catch(() => {
      //     this.validWorkspace = false;
      //     this.utilityService.errorNotification($localize`:@@authNewWorkplace.nameTaken:This workplace name is taken, kindly come up with another one!`);
      //   });
      
      // It used to block the creation of two workspaces with the same name, because the product was initially design to be deployed on-premise
      this.validWorkspace = true;
    }
  }

  selectStripeProduct(productId: string) {
    this.workplace.stripe_product_id = productId;
  }

  /**
   * This function is responsible for creating a new workplace
   *
   * @param name
   * @param company_name
   */
  createNewWorkplace() {
    try {
      if (!this.validWorkspace
          || this.workplace.company_name == null || this.workplace.company_name == ''
          || this.workplace.stripe_product_id == null || this.workplace.stripe_product_id == '') {
        this.utilityService.warningNotification($localize`:@@authNewWorkplace.insufficientData:Insufficient or incorrect data, kindly fill up all the fields correctly!`);
      } else {
        // PREPARING THE WORKPLACE DATA
        let workplaceData: Object = {
          workspace_name: this.workplace.name.trim(),
          company_name: this.workplace.company_name.trim(),
          stripe_product_id: this.workplace.stripe_product_id.trim()
        }
        this.utilityService.asyncNotification($localize`:@@authNewWorkplace.pleaseWaitSettingUp:Please wait while we are setting up your new workplace and account...`,
          this.newWorkplaceServiceFunction(workplaceData));
      }
    } catch (err) {
      console.log('There\'s some unexpected error occurred, please try again later!', err);
      this.utilityService.errorNotification($localize`:@@authNewWorkplace.unexpectedError:There\'s some unexpected error occurred, please try again later!`);
    }
  }

  /**
   * This implements the service function for @function createNewWorkplace(workplaceData)
   * @param workspaceData
   */
  newWorkplaceServiceFunction(workspaceData: any) {
    return new Promise((resolve, reject) => {
      this.authenticationService.createNewWorkspace(workspaceData, this.accountData)
        .then((res) => {
          this.clearUserData();
          this.storeData(res);
          this.router.navigate(['dashboard', 'myspace', 'inbox'])
            .then(() => {
              this.utilityService.successNotification($localize`:@@authNewWorkplace.welcomeToWorkplace:Hi ${res['user']['first_name']}, welcome to your new workplace!`);
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@authNewWorkplace.welcomeToWorkplace:Hi ${res['user']['first_name']}, welcome to your new workplace!`))
            })
            .catch(() => {
              this.utilityService.errorNotification($localize`:@@authNewWorkplace.oopsErrorOccuredSettingUp:Oops some error occurred while setting you up, please try again!`);
              reject(this.utilityService.rejectAsyncPromise($localize`:@@authNewWorkplace.oopsErrorOccuredSettingUp:Oops some error occurred while setting you up, please try again!`))
            })

        }, (err) => {
          console.error('Error occurred while creating new workplace', err);
          this.utilityService.errorNotification($localize`:@@authNewWorkplace.oopsErrorOccuredSettingUp:Oops some error occurred while setting you up, please try again!`);
          this.storageService.clear();
          reject(this.utilityService.rejectAsyncPromise($localize`:@@authNewWorkplace.oopsErrorOccuredSettingUp:Oops some error occurred while setting you up, please try again!`))
        })
    })
  }

  async openPricingDialog() {
    const dialogRef = await this.dialog.open(this.pricingTableDialog, {
      width: '75%',
      height: '50%',
      disableClose: false,
      hasBackdrop: true
    });

    dialogRef.afterClosed().subscribe(() => {});
  }

  /**
   * This function clear the user Object
   */
  clearUserData() {
    this.publicFunctions.sendUpdatesToUserData({});
  }

  /**
   * This function stores the user related data and token for future reference in the browser
   * @param res
   */
  storeData(res: Object) {
    this.publicFunctions.sendUpdatesToUserData(res['user']);
    this.storageService.setLocalData('authToken', JSON.stringify(res['token']));
  }
}
