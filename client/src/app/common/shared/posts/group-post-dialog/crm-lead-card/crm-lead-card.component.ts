import { Component, Input, OnChanges, ViewEncapsulation, Injector, OnInit } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';
import { CRMGroupService } from 'src/shared/services/crm-group-service/crm-group.service';
import { PostService } from 'src/shared/services/post-service/post.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-crm-lead-card',
  templateUrl: './crm-lead-card.component.html',
  styleUrls: ['./crm-lead-card.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CRMLeadCardComponent implements OnChanges, OnInit {

  @Input() postData;
  @Input() userData;
  @Input() groupData;
  @Input() isAdmin: boolean = false;


  companySearchResults = [];
  companySearchText = '';
  
  contactSearchResults = [];
  contactSearchText = '';

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  // Subsink Object
  subSink = new SubSink();

  constructor(
    private crmGroupService: CRMGroupService,
    private postService: PostService,
    public utilityService: UtilityService,
    private injector: Injector
  ) { }

  ngOnChanges() {
  }

  ngOnInit() {
    
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subSink.unsubscribe();
  }

  async selectCompany(company: any) {
    if (!this.postData.crm) {
      this.postData.crm = {};
    }

    this.postData.crm._company = company;

    if (!company) {
      this.postData.crm._contacts = [];
    }

    this.companySearchText = '';

    await this.utilityService.asyncNotification($localize`:@@crmLeadCard.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
      this.postService.saveCRMInfo(this.postData._id, this.postData.crm)
        .then((res) => {
          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@crmLeadCard.detailsUpdated:Details updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@crmLeadCard.unableToUpdateDetails:Unable to update the details, please try again!`));
        });
    }));
  }

  async selectContact(contact) {
    if (!this.postData.crm) {
      this.postData.crm = {};
    }

    if (!this.postData.crm._contacts) {
      this.postData.crm._contacts = [];
    }

    if (!this.postData.crm._company) {
      this.postData.crm._company = contact._company;
    }

    this.postData.crm._contacts.push(contact);
    this.contactSearchText = '';

    await this.utilityService.asyncNotification($localize`:@@crmLeadCard.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
      this.postService.saveCRMInfo(this.postData._id, this.postData.crm)
        .then((res) => {
          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@crmLeadCard.detailsUpdated:Details updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@crmLeadCard.unableToUpdateDetails:Unable to update the details, please try again!`));
        });
    }));
  }

  searchCompany() {
    this.crmGroupService.searchCRMCompanies(this.groupData._id, this.companySearchText).then(res => {
        this.companySearchResults = res['companies'];
      });
  }

  searchContact() {
    this.crmGroupService.searchCRMContacts(this.groupData?._id, this.postData?.crm?._company?._id, this.contactSearchText).then(res => {
        this.contactSearchResults = res['contacts'];
      });
  }
}
