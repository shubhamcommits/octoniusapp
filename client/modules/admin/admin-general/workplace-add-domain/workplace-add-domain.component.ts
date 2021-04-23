import { Component, OnInit, Input } from '@angular/core';
import { AdminService } from 'src/shared/services/admin-service/admin.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Component({
  selector: 'app-workplace-add-domain',
  templateUrl: './workplace-add-domain.component.html',
  styleUrls: ['./workplace-add-domain.component.scss']
})
export class WorkplaceAddDomainComponent implements OnInit {

  constructor(
    private adminService: AdminService,
    public utilityService: UtilityService,
  ) { }

  @Input('workspaceData') workspaceData: any;

  addDomain: string;

  allowedDomains: any = [];

  isLoading$ = new BehaviorSubject(false);

  async ngOnInit() {
    this.allowedDomains = await this.getAllowedDomains(this.workspaceData['_id'])
  }

  async addDomainName(workspaceId: string, domain: string) {
    try {
      this.utilityService.asyncNotification('Please wait, while we are adding the domain...', new Promise((resolve, reject) => {
        let index = this.allowedDomains.findIndex(domainName => domainName.trim().toLowerCase() === domain.trim().toLowerCase());
        if (index != -1) {
          resolve(this.utilityService.resolveAsyncPromise(`Seems like the ${domain} domain already exist!`))
        } else {
          this.adminService.addToAllowedDomain(workspaceId, domain)
            .subscribe((res) => {
              this.allowedDomains.push(domain);
              this.addDomain = '';
              resolve(this.utilityService.resolveAsyncPromise(`${domain} has been added to the allowed domains!`))
            }, (err) => {
              this.addDomain = '';
              console.log('Error occured, while adding the domain', err);
              reject(this.utilityService.rejectAsyncPromise('Oops, an error occured while adding the domain, please try again!'))
            })
        }
      }))
    } catch (err) {
      console.log('There\'s some unexpected error occured, please try again!', err);
      this.utilityService.errorNotification('There\'s some unexpected error occured, please try again!');
    }
  }

  async getAllowedDomains(workspaceId: string) {
    try {
      this.isLoading$.next(true);
      return new Promise((resolve, reject) => {
        this.adminService.getAllowedDomains(workspaceId.trim())
          .subscribe((res) => {
            this.isLoading$.next(false);
            resolve(res['domains']);
          }, (err) => {
            console.log('Error occured, while fetching the list of allowed email domains', err);
            this.utilityService.errorNotification('Oops, an error occured while fetching the list of email domain, please try refreshing the page!');
            this.isLoading$.next(false);
            reject([]);
          })
      })
    } catch (err) {
      console.log('There\'s some unexpected error occured, please try again!', err);
      this.utilityService.errorNotification('There\'s some unexpected error occured, please try again!');
    }
  }

  async removeDomain(workspaceId: string, domain: string) {
    try {
      const ownerDomain = this.workspaceData.owner_email.split('@')[1];
      if (domain == ownerDomain) {
        this.utilityService.errorNotification('The owner uses this domain, it cannot be removed!');
      } else {
        this.utilityService.getConfirmDialogAlert()
          .then((result) => {
            if (result.value) {
              this.utilityService.asyncNotification('Please wait, while we are removing the domain for you', new Promise((resolve, reject)=>{
                this.adminService.removeDomain(workspaceId, domain)
                .subscribe((res) => {
                  let index = this.allowedDomains.findIndex(domainName => domainName.trim().toLowerCase() === domain.trim().toLowerCase());
                  this.allowedDomains.splice(index, 1);
                  resolve(this.utilityService.resolveAsyncPromise(`${domain} has been removed from the allowed domains!`));
                }, (err) => {
                  console.log('Error occured, while removing the domain', err);
                  resolve(this.utilityService.rejectAsyncPromise('Oops, an error occured while removing the domain, please try again!'));
                })
              }))
            }
          });
        }
    } catch (err) {
      console.log('There\'s some unexpected error occured, please try again!', err);
      this.utilityService.errorNotification('There\'s some unexpected error occured, please try again!');
    }
  }

  ngOnDestroy(){
    this.isLoading$.complete();
  }


}
