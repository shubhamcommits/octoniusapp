import { Component, OnChanges, Input, SimpleChanges, Injector, LOCALE_ID, Inject, Output, EventEmitter } from '@angular/core';

import { environment } from 'src/environments/environment';
import { PublicFunctions } from 'modules/public.functions';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { LibreofficeService } from 'src/shared/services/libreoffice-service/libreoffice.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { FilesService } from 'src/shared/services/files-service/files.service';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnChanges {

  @Input() data: any;
  @Input() type: string;
  @Input() workspaceId: string;

  @Output() closeSearchEvent = new EventEmitter();

  customFields: any = [];

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
      @Inject(LOCALE_ID) public locale: string,
      public storageService: StorageService,
      public utilityService: UtilityService,
      private libreofficeService: LibreofficeService,
      private filesService: FilesService,
      private injector: Injector
    ) { }

  async ngOnChanges(changes: SimpleChanges) {
    this.data = changes.data.currentValue;

    if (this.data) {
      // Get the CF names used
      if (this.type == 'file') {

        await this.filesService.getPathToFile(this.data._id).then(res => {
          this.data.path_to_file = res['filePath']
        });
        //this._router.navigate(['/dashboard', 'work', 'groups', 'files'], { queryParams: { folder: data?._folder?._id || data?._folder } });

        if (this.data?.custom_fields) {
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
    let contentOps;
    if (this.type == 'post' && this.data && this.data.content && this.data.content != "") {
      // Initiate the converter
      // converter = new QuillDeltaToHtmlConverter(JSON.parse(this.data.content)['ops'], cfg);
      contentOps = JSON.parse(this.data.content)['ops'];
    }

    if (this.type == 'file' && this.data && this.data.description && this.data.description != "") {
      // Initiate the converter
      // converter = new QuillDeltaToHtmlConverter(JSON.parse(this.data.description)['ops'], cfg);
      contentOps = JSON.parse(this.data.description)['ops'];
    }

    // if (converter) {
    //   converter.renderCustomWith((customOp) => {
    //     // Conditionally renders blot of mention type
    //     if(customOp.insert.type === 'mention'){
    //       // Get Mention Blot Data
    //       const mention = customOp.insert.value;

    //       // Template Return Data
    //       return (
    //         `<span
    //           class="mention"
    //           data-index="${mention.index}"
    //           data-denotation-char="${mention.denotationChar}"
    //           data-link="${mention.link}"
    //           data-value='${mention.value}'>
    //           <span contenteditable="false">
    //             ${mention.value}
    //           </span>
    //         </span>`
    //       )
    //     }
    //   });
    //   // Convert into html
    //   html = converter.convert();
    // }
    html = await this.publicFunctions.convertQuillToHTMLContent(contentOps);

    if (html) {
      this.data.html = html
    }
    /**
     * END of Generate the html of the content of the post or the description of the file
     */
  }

  generatePostURL() {
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

  generatePageURL() {
    let url = environment.clientUrl;
    if (environment.production) {
      url += '/' + this.locale;
    }

    return url + '/dashboard/work/groups/library/collection/page?page=' + this.data?._id;
  }

  generateUserURL(userId) {
    let url = environment.clientUrl;
    if (environment.production) {
      url += '/' + this.locale;
    }
    return url + '/dashboard/user/profile?userId=' + userId;
  }

  generateFileURL() {
    return environment.UTILITIES_FILES_UPLOADS + '/' + this.workspaceId + '/' + this.data.modified_name + '?authToken=Bearer ' + this.storageService.getLocalData('authToken')['token'];
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
    let workspaceId = '';
    if (this.data._workspace && this.data._workspace._id) {
      workspaceId = this.data._workspace._id;
    } else {
      const workspace: any = await this.publicFunctions.getCurrentWorkspace();
      workspaceId = workspace._id;
    }
    window.open(await this.publicFunctions.getLibreOfficeURL(fileId, workspaceId), "_blank");
  }

  openFullscreenModal(userId: string) {
    this.utilityService.openMeberBusinessCard(userId);
  }

  closeSearch() {
    this.closeSearchEvent.emit();
  }
}
