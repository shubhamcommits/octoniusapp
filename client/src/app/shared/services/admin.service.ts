import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import { Subject } from 'rxjs/Subject';

// Disabling Client side caching
// import { Cacheable, CacheBuster } from 'ngx-cacheable';
// import { DOMStorageStrategy } from 'ngx-cacheable/common/DOMStorageStrategy';

const cacheBuster$ = new Subject<void>();

@Injectable()
export class AdminService {

  BASE_API_URL = environment.BASE_API_URL;

  constructor(private _http: HttpClient) { }

  // @CacheBuster({
  //   cacheBusterNotifier: cacheBuster$
  // })
  allowDomain(workspace_id, domainName) {
    // console.log(data);
    return this._http.post(this.BASE_API_URL + `/workspaces/${workspace_id}/domains`, domainName);
  }

  // @CacheBuster({
  //   cacheBusterNotifier: cacheBuster$
  // })
  removeDomain(workspace_id, domainName) {
    // console.log(data);
    return this._http.delete(this.BASE_API_URL + `/workspaces/${workspace_id}/domains/${domainName}`);
  }

  // @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  // })
  allowedDomains(workspace_id) {
    return this._http.get(this.BASE_API_URL + '/workspaces/'+ workspace_id + '/domains');
  }

  inviteNewUserViewEmail(data) {
    // console.log(data);
    return this._http.post<any>(this.BASE_API_URL + '/workspace/inviteUserViaEmail', data);
  }

  updateUserRole(data) {
    //this.manuallyBustCache();
    return this._http.put<any>(this.BASE_API_URL + '/workspace/updateUserRole', data);
  }

  removeUser(workspaceId, userId) {
    //this.manuallyBustCache();
    return this._http.delete(this.BASE_API_URL + `/workspaces/${workspaceId}/users/${userId}`);
  }

  /**
   * Manually busting a part of the cache whose service methods
   * are in another service.ts file.
   * 
   * This method particularly handles the updating of workplace data.
   */
  manuallyBustCache(): void {
    const cache = JSON.parse(localStorage.getItem('CACHE_STORAGE'));
    if (environment.production) {
      cache['n#getWorkspace'] = undefined;
    } else {
      cache['WorkspaceService#getWorkspace'] = undefined;
    }
    localStorage.setItem('CACHE_STORAGE', JSON.stringify(cache));
  }
}
