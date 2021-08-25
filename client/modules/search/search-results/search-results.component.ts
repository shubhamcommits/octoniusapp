import { Component, OnInit, Input, SimpleChanges, Injector, LOCALE_ID, Inject } from '@angular/core';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html'
import { environment } from 'src/environments/environment';
import { PublicFunctions } from 'modules/public.functions';
import { StorageService } from 'src/shared/services/storage-service/storage.service';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {

  @Input() data: any;
  @Input() type: string;

  constructor(
      @Inject(LOCALE_ID) public locale: string,
      public storageService: StorageService
    ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {

    // Fetch the changed contents
    let changedContent = changes.data.currentValue.content

    // Add the data content
    this.data.content = changedContent

    // Create an empyt cfg object
    let cfg = {}

    if(this.data.content != "" && this.data.content != null){

      // Initiate the converter
      var converter = new QuillDeltaToHtmlConverter(JSON.parse(this.data.content)['ops'], cfg)

      // Convert into html
      var html = converter.convert()

      // Add the html dynamically
      this.data.html = html
    }
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
