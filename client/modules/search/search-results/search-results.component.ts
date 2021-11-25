import { Component, OnChanges, Input, SimpleChanges, Injector, LOCALE_ID, Inject } from '@angular/core';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html'
import { environment } from 'src/environments/environment';
import { PublicFunctions } from 'modules/public.functions';
import { StorageService } from 'src/shared/services/storage-service/storage.service';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnChanges {

  @Input() data: any;
  @Input() type: string;

  customFieldsKeys: any = [];

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
      @Inject(LOCALE_ID) public locale: string,
      public storageService: StorageService,
      private injector: Injector
    ) { }

  async ngOnChanges(changes: SimpleChanges) {
    this.data = changes.data.currentValue;

    if (this.data) {
      // Get the CF names used
      if (this.type == 'file' && this.data?.custom_fields) {
        this.customFieldsKeys = Object.keys(this.data?.custom_fields);
      } else if (this.type == 'post' && this.data?.task && this.data?.task?.custom_fields) {
        this.customFieldsKeys = Object.keys(this.data?.task?.custom_fields);
      } else if (this.type == 'user' && this.data?.profile_custom_fields) {
        this.customFieldsKeys = Object.keys(this.data?.profile_custom_fields);
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
      return url + '/dashboard/work/groups/tasks?group=' + group + '&myWorkplace=false&postId=' + this.data._id;
    } else {
      return url + '/dashboard/work/groups/activity?group=' + group + '&myWorkplace=false&postId=' + this.data._id;
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
}
