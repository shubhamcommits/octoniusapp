import { Component, OnChanges, Input, SimpleChanges, Injector, LOCALE_ID, Inject } from '@angular/core';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html'
import { environment } from 'src/environments/environment';
import { PublicFunctions } from 'modules/public.functions';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { LibreofficeService } from 'src/shared/services/libreoffice-service/libreoffice.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-organization-search-results',
  templateUrl: './organization-search-results.component.html',
  styleUrls: ['./organization-search-results.component.scss']
})
export class OrganizationSearchResultsComponent implements OnChanges {

  @Input() data: any;

  customFields: any = [];

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
      @Inject(LOCALE_ID) public locale: string,
      public storageService: StorageService,
      public utilityService: UtilityService,
      private libreofficeService: LibreofficeService,
      private injector: Injector
    ) { }

  async ngOnChanges(changes: SimpleChanges) {
    this.data = changes.data.currentValue;

    if (this.data && this.data?.profile_custom_fields) {
      const customFieldsKeys = Object.keys(this.data?.profile_custom_fields);
      this.customFields = [];
      if (this.data._workspace && this.data._workspace.profile_custom_fields) {
        this.data._workspace.profile_custom_fields.forEach(async cf => {
          const index = (customFieldsKeys) ? customFieldsKeys.findIndex(key => key == cf.name) : -1;
          if (index >= 0 && this.data?.profile_custom_fields[cf.name]
              && this.data?.profile_custom_fields[cf.name] != ''
              && (!cf.hide_in_business_card || ['owner', 'admin', 'manager'].includes(this.data?.role))) {
            if (cf.user_type) {
              this.data.profile_custom_fields[cf.name] = await this.publicFunctions.getOtherUser(this.data.profile_custom_fields[cf.name]);
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
    this.utilityService.openFullscreenModal(userId);
  }
}
