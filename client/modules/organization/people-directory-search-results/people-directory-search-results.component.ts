import { Component, OnChanges, Input, SimpleChanges, Injector, LOCALE_ID, Inject } from '@angular/core';
import { environment } from 'src/environments/environment';
import { PublicFunctions } from 'modules/public.functions';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-people-directory-search-results',
  templateUrl: './people-directory-search-results.component.html',
  styleUrls: ['./people-directory-search-results.component.scss']
})
export class PeopleDirectorySearchResultsComponent implements OnChanges {

  @Input() searchedUsers: any;

  customFields: any = [];

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
      @Inject(LOCALE_ID) public locale: string,
      public storageService: StorageService,
      public utilityService: UtilityService,
      private injector: Injector
    ) { }

  async ngOnChanges(changes: SimpleChanges) {
    this.searchedUsers = changes?.searchedUsers?.currentValue;

    if (this.searchedUsers && this.searchedUsers?.profile_custom_fields) {
      const customFieldsKeys = Object.keys(this.searchedUsers?.profile_custom_fields);
      this.customFields = [];
      if (this.searchedUsers._workspace && this.searchedUsers._workspace.profile_custom_fields) {
        this.searchedUsers._workspace.profile_custom_fields.forEach(async cf => {
          const index = (customFieldsKeys) ? customFieldsKeys.findIndex(key => key == cf.name) : -1;
          if (index >= 0 && this.searchedUsers?.profile_custom_fields[cf.name]
              && this.searchedUsers?.profile_custom_fields[cf.name] != ''
              && (!cf.hide_in_business_card || ['owner', 'admin', 'manager'].includes(this.searchedUsers?.role))) {
            if (cf.user_type) {
              this.searchedUsers.profile_custom_fields[cf.name] = await this.publicFunctions.getOtherUser(this.searchedUsers.profile_custom_fields[cf.name]);
            }
            this.customFields.push(cf);
          }
        });
      }
    }
  }

  generateUserURL(userId) {
    let url = environment.clientUrl;
    if (environment.production) {
      url += '/' + this.locale;
    }
    return url + '/dashboard/user/profile?userId=' + userId;
  }

  openFullscreenModal(userId: string) {
    this.utilityService.openMeberBusinessCard(userId);
  }
}
