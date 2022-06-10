import { Component, OnChanges, Input, SimpleChanges, Injector, LOCALE_ID, Inject } from '@angular/core';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html'
import { environment } from 'src/environments/environment';
import { PublicFunctions } from 'modules/public.functions';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { LibreofficeService } from 'src/shared/services/libreoffice-service/libreoffice.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnChanges {

  @Input() data: any;
  @Input() type: string;

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

    if (this.data) {
      // Get the CF names used
      if (this.type == 'file' && this.data?.custom_fields) {
        const customFieldsKeys = Object.keys(this.data?.custom_fields);
        this.customFields = [];
        if (this.data._group && this.data._group.custom_fields) {
          this.data._group.custom_fields.forEach(cf => {
            const index = (customFieldsKeys) ? customFieldsKeys.findIndex(key => key == cf.name) : -1;
            if (index >= 0 && this.data?.custom_fields[cf.name] && this.data?.custom_fields[cf.name] != '') {
              this.customFields.push(cf);
            }
          });
        }
      } else if (this.type == 'post' && this.data?.task && this.data?.task?.custom_fields) {
        const customFieldsKeys = Object.keys(this.data?.task?.custom_fields);
        this.customFields = [];
        if (this.data._group && this.data._group.custom_fields) {
          this.data._group.custom_fields.forEach(cf => {
            const index = (customFieldsKeys) ? customFieldsKeys.findIndex(key => key == cf.name) : -1;
            if (index >= 0 && this.data?.task?.custom_fields[cf.name] && this.data?.task?.custom_fields[cf.name] != '') {
              this.customFields.push(cf);
            }
          });
        }
      } else if (this.type == 'user' && this.data?.profile_custom_fields) {
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

    /**
     * START of Generate the html of the content of the post or the description of the file
     */
    // Create an empyt cfg object
    let cfg = {};
    let converter;
    let html;
    if (this.type == 'post' && this.data && this.data.content && this.data.content != "") {
      // Initiate the converter
      converter = new QuillDeltaToHtmlConverter(JSON.parse(this.data.content)['ops'], cfg);
    }

    if (this.type == 'file' && this.data && this.data.description && this.data.description != "") {
      // Initiate the converter
      converter = new QuillDeltaToHtmlConverter(JSON.parse(this.data.description)['ops'], cfg);
    }

    if (converter) {
      // Convert into html
      html = converter.convert();
    }

    if (html) {
      this.data.html = html
    }
    /**
     * END of Generate the html of the content of the post or the description of the file
     */
  }

  generatePostURL() {
    const group = (this.data._group._id) ? this.data._group._id : this.data._group;
    let url = environment.clientUrl;
    if (environment.production) {
      url += '/' + this.locale;
    }

    if (this.data.type === 'task') {
      return url + '/dashboard/work/groups/tasks?postId=' + this.data._id;
    } else {
      return url + '/dashboard/work/groups/activity?postId=' + this.data._id;
    }
  }

  generateUserURL(userId) {
    let url = environment.clientUrl;
    if (environment.production) {
      url += '/' + this.locale;
    }
    return url + '/dashboard/user/profile?userId=' + userId;
  }

  generateFileURL() {
    return environment.UTILITIES_FILES_UPLOADS + '/' + this.data.modified_name + '?authToken=Bearer ' + this.storageService.getLocalData('authToken')['token'];
  }

  getFileExtension(fileName: string) {
    let file = fileName.split(".");
    let fileType = file[file.length-1].toLowerCase();
    if (fileType == 'mp4') {
      fileType = 'mov';
    }
    return fileType;
  }

  isOfficeFile(fileName: string) {
    const officeExtensions = ['ott', 'odm', 'doc', 'docx', 'xls', 'xlsx', 'ods', 'ots', 'odt', 'xst', 'odg', 'otg', 'odp', 'ppt', 'otp', 'pot', 'odf', 'odc', 'odb'];
    const fileExtension = this.getFileExtension(fileName);
    return officeExtensions.includes(fileExtension);
  }

  async openOfficeDoc(fileId: string) {
    window.open(await this.getLibreOfficeURL(fileId), "_blank");
  }

  async getLibreOfficeURL(fileId: string) {
    // wopiClientURL = https://<WOPI client URL>:<port>/browser/<hash>/cool.html?WOPISrc=https://<WOPI host URL>/<...>/wopi/files/<id>
    let wopiClientURL = '';
    await this.libreofficeService.getLibreofficeUrl().then(res => {
        const authToken = `Bearer ${this.storageService.getLocalData('authToken')['token']}`;
        wopiClientURL = res['url'] + 'WOPISrc=' + `${environment.UTILITIES_BASE_API_URL}/libreoffice/wopi/files/${fileId}?authToken=${authToken}`;
      }).catch(error => {
        this.utilityService.errorNotification($localize`:@@groupFiles.errorRetrievingLOOLUrl:Not possible to retrieve the complete Office Online url`);
      });
    return wopiClientURL;
  }

  openFullscreenModal(userId: string) {
    this.utilityService.openMeberBusinessCard(userId);
  }
}
