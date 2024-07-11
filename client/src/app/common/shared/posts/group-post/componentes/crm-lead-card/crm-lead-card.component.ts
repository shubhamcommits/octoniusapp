import { Component, Input, OnChanges, ViewEncapsulation, Injector } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Sort } from '@angular/material/sort';
import { CRMContactDialogComponent } from 'modules/groups/group/group-crm-setup-view/crm-contact-dialog/crm-contact-dialog.component';
import { PublicFunctions } from 'modules/public.functions';
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
export class CRMLeadCardComponent implements OnChanges {

  @Input() postData;
  @Input() userData;
  @Input() groupData;
  @Input() isAdmin: boolean = false;


  companySearchResults = [];
  companySearchText = '';
  
  contactSearchResults = [];
  contactSearchText = '';

  sortedData;
	displayedColumns: string[] = ['name', 'position', /*'phone', 'email', 'link',*/ 'star'];
	crmCustomFieldsToShow = [];
	crmContactCustomFields = [];

  // Public Functions class object
  publicFunctions = new PublicFunctions(this.injector);

  // Subsink Object
  subSink = new SubSink();

  constructor(
    private crmGroupService: CRMGroupService,
    private postService: PostService,
    public utilityService: UtilityService,
    public dialog: MatDialog,
    private injector: Injector
  ) { }

  async ngOnChanges() {
    await this.initTable();
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subSink.unsubscribe();
  }

	async initTable() {
		await this.loadCustomFieldsToShow();

    if (!!this.postData.crm) {
      this.postData.crm._contacts = [...this.postData.crm._contacts];
  
      this.sortedData = this.postData.crm._contacts.slice();
    }
	}

	loadCustomFieldsToShow() {
		if (!!this.groupData && !!this.groupData.crm_custom_fields_to_show) {
			if (!this.crmCustomFieldsToShow) {
				this.crmCustomFieldsToShow = [];
			}
			
			this.groupData.crm_custom_fields_to_show.forEach(field => {
				const cf = this.getCustomField(field);
				const indexCRMCFToShow = (!!this.crmCustomFieldsToShow) ? this.crmCustomFieldsToShow.findIndex(cf => cf.name === field) : -1;
				// Push the Column
				if (cf && indexCRMCFToShow < 0 && cf.type == 'contact') {
					this.crmCustomFieldsToShow.push(cf);
			
					if (this.displayedColumns.length - 1 >= 0) {
						const indexDisplayedColumns = (!!this.displayedColumns) ? this.displayedColumns.findIndex(col => col === field.name) : -1;
						if (indexDisplayedColumns < 0) {
							this.displayedColumns.splice(this.displayedColumns.length - 1, 0, field);
						}
					}
				}
			});
		}
	}

	getCustomField(fieldName: string) {
		const index = (this.crmContactCustomFields) ? this.crmContactCustomFields.findIndex((f: any) => f.name === fieldName) : -1;
		return (index >= 0) ? this.crmContactCustomFields[index] : null;
	}

	sortData(sort: Sort) {
		const direction = sort.direction;
		let property = sort.active;
		let directionValue = (direction == 'asc') ? 1 : -1;

		const data = this.postData.crm._contacts.slice();
		if (!property || direction === '') {
			this.sortedData = data;
			return;
		}

		this.sortedData = data.sort((a, b) => {
			switch (property) {
				case 'company':
					return this.utilityService.compare(a?._company.name, b?._company.name, directionValue);
				
				case 'phone':
				case 'email':
				case 'link':
					property += 's';
					return this.utilityService.compare(a[property][0], b[property][0], directionValue);
				default:
					const index = (this.crmContactCustomFields) ? this.crmContactCustomFields.findIndex((f: any) => f.name === property) : -1;
					return (index < 0) ? 
						this.utilityService.compare(a[property], b[property], directionValue) :
						this.utilityService.compare(a.crm_custom_fields[property], b.crm_custom_fields[property], directionValue);
			}
		});
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

    this.updateCRM(this.postData?._id, this.postData?.crm);
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

    this.updateCRM(this.postData?._id, this.postData?.crm);
  }

  searchCompany() {
    this.crmGroupService.searchCRMCompanies(this.groupData._id, this.companySearchText).then(res => {
      this.companySearchResults = res['companies'];
      const index = (!!this.companySearchResults) ? this.companySearchResults.findIndex(comp => comp.name === this.companySearchText) : -1;
      if (index < 0) {
        this.companySearchResults.unshift({
          name: this.companySearchText
        });
      }
    });
  }

  searchContact() {
    this.crmGroupService.searchCRMContacts(this.groupData?._id, this.postData?.crm?._company?._id, this.contactSearchText).then(res => {
        this.contactSearchResults = res['contacts'].filter(contact => {
          const index = this.postData.crm._contacts.findIndex((c: any) => c._id === contact._id);
          return index < 0;
        });

        const index = (!!this.contactSearchResults) ? this.contactSearchResults.findIndex(cont => cont.name === this.contactSearchText) : -1;
        if (index < 0 && !!this.postData.crm._company) {
          this.contactSearchResults.unshift({
            name: this.contactSearchText
          });
        }
      });
  }
	
	deleteContactFromLead(contactId: string) {
    const index = this.postData.crm._contacts.findIndex((c: any) => c._id === contactId);
    this.postData.crm._contacts.splice(index, 1);
    
    this.updateCRM(this.postData?._id, this.postData?.crm);
  }

  async updateCRM(postId: string, crm: any) {
    await this.utilityService.asyncNotification($localize`:@@crmLeadCard.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
      this.postService.saveCRMInfo(postId, crm)
        .then((res) => {
          this.initTable();

          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@crmLeadCard.detailsUpdated:Details updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@crmLeadCard.unableToUpdateDetails:Unable to update the details, please try again!`));
        });
    }));
  }

  async createCompany(company: any) {
    await this.utilityService.asyncNotification($localize`:@@crmLeadCard.plesaeWaitWeAreCreatingCompany:Please wait we are creating the company and updating the contents...`, new Promise((resolve, reject) => {
      let companyToCreate = {
          name: company.name,
          description: '',
          _group: this.groupData?._id
        };

        this.crmGroupService.createCRMCompany(companyToCreate).then(res => {
          this.selectCompany(res['company']);

          // Resolve with success
          resolve(this.utilityService.resolveAsyncPromise($localize`:@@crmLeadCard.detailsUpdated:Details updated!`));
        })
        .catch(() => {
          reject(this.utilityService.rejectAsyncPromise($localize`:@@crmLeadCard.unableToUpdateDetails:Unable to update the details, please try again!`));
        });
    }));
  }

  async createContact(contact: any) {
    await this.utilityService.asyncNotification($localize`:@@crmLeadCard.plesaeWaitWeAreCreatingContact:Please wait we are creating the contact and updating the contents...`, new Promise((resolve, reject) => {
      let contactToSave: any = {
        name: contact?.name,
        _group: this.groupData?._id,
        _company: this.postData.crm._company,
        phones: [],
        emails: [],
        links: [],
        position: ''
      };

      this.crmGroupService.createCRMContact(contactToSave).then(res => {
        this.selectContact(res['contact']);

        // Resolve with success
        resolve(this.utilityService.resolveAsyncPromise($localize`:@@crmLeadCard.detailsUpdated:Details updated!`));
      })
      .catch(() => {
        reject(this.utilityService.rejectAsyncPromise($localize`:@@crmLeadCard.unableToUpdateDetails:Unable to update the details, please try again!`));
      });
    }));
  }

  openContactDialog(contactId?: string) {
		const dialogRef = this.dialog.open(CRMContactDialogComponent, {
      disableClose: true,
      hasBackdrop: true,
      width: '60%',
      height: '50%',
      data: {
        contactId: contactId
      }
		});
  }
}
