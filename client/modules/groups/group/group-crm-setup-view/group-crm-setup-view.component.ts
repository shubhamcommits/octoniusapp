import { Component, OnInit, OnDestroy, Injector, AfterContentChecked, ChangeDetectorRef } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SubSink } from 'subsink';
import { PublicFunctions } from 'modules/public.functions';
import { CRMGroupService } from 'src/shared/services/crm-group-service/crm-group.service';

@Component({
  selector: 'app-group-crm-setup-view',
  templateUrl: './group-crm-setup-view.component.html',
  styleUrls: ['./group-crm-setup-view.component.scss']
})
export class GroupCRMSetupViewComponent implements OnInit, OnDestroy, AfterContentChecked {

  contacts = [];
  companies = [];

  groupData: any;
  
  isAdmin = false;

  userData: any;
  workspaceData: any;
  
  // IsLoading behaviou subject maintains the state for loading spinner
  isLoading$;

  // Subsink Object
  subSink = new SubSink();

  // PUBLIC FUNCTIONS
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public utilityService: UtilityService,
    private crmGroupService: CRMGroupService,
    private changeDetectorRef: ChangeDetectorRef,
    private injector: Injector) { }


  async ngOnInit() {
    // Start the loading spinner
    this.utilityService.updateIsLoadingSpinnerSource(true);

    this.groupData = await this.publicFunctions.getCurrentGroupDetails();
    this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    this.userData = await this.publicFunctions.getCurrentUser();

    this.isAdmin = this.isAdminUser();

    this.crmGroupService.getGroupCRMContacts(this.groupData?._id).then(res => {
      this.contacts = res['contacts'];
    });

    this.crmGroupService.getCRMCompanies(this.groupData?._id).then(res => {
      this.companies = res['companies'];
    });

    // End the loading spinner
    this.utilityService.updateIsLoadingSpinnerSource(false);
  }

  ngAfterContentChecked() {
    this.subSink.add(this.utilityService.isLoadingSpinner.subscribe((res) => {
      this.isLoading$ = res;
    }));
  }

  /**
   * Unsubscribe all the observables to avoid memory leaks
   */
  ngOnDestroy() {
    this.subSink.unsubscribe();
  }

  // onCompanyCreated(company: any) {
  //   if (!this.companies) {
  //     this.companies = []
  //   }

  //   this.companies.unshift(company);

  //   this.changeDetectorRef.detectChanges()
  // }

  // onCompanyEdited(company: any) {
  //   if (!this.companies) {
  //     this.companies = []
  //   }

  //   const index = (this.companies) ? this.companies.findIndex(c => c._id == company._id) : -1;
  //   this.companies[index] = company;

  //   this.changeDetectorRef.detectChanges()
  // }
  
  // onCompanyDeleted(companyId: string) {
  //   const index = (this.companies) ? this.companies.findIndex(c => c._id == companyId) : -1;
  //   if (index >= 0) {
  //     this.companies.splice(index, 1);
  //   }

  //   this.changeDetectorRef.detectChanges()
  // }

  // onContactCreated(contact: any) {
  //   if (!this.contacts) {
  //     this.contacts = []
  //   }

  //   this.contacts.unshift(contact);

  //   this.changeDetectorRef.detectChanges()
  // }

  // onContactEdited(contact: any) {
  //   const index = (this.contacts) ? this.contacts.findIndex(c => c._id == contact._id) : -1;
  //   if (index >= 0) {
  //     this.contacts[index] = contact;
  //   }

  //   this.changeDetectorRef.detectChanges();
  // }
  
  // onContactDeleted(contactId: string) {
  //   const index = (this.contacts) ? this.contacts.findIndex(c => c._id == contactId) : -1;
  //   if (index >= 0) {
  //     this.contacts.splice(index, 1);
  //   }

  //   this.changeDetectorRef.detectChanges();
  // }

  isAdminUser() {
    const index = this.groupData._admins.findIndex((admin: any) => admin._id === this.userData._id);
    return index >= 0;
  }
}
