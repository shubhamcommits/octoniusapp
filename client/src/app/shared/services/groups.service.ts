import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {Subject} from "rxjs/Subject";
import { Observable } from 'rxjs';
import { Cacheable, CacheBuster } from 'ngx-cacheable';
import { DOMStorageStrategy } from 'ngx-cacheable/common/DOMStorageStrategy';

const cacheBuster$ = new Subject<void>();

@Injectable()
export class GroupsService {

  BASE_API_URL = environment.BASE_API_URL;

  constructor(private _http: HttpClient) { }

  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
  createNewGroup(group) {
    return this._http.post(this.BASE_API_URL + '/workspace/groups/', group);
  }

  @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  })
  getUserGroups(user) {
    return this._http.get(this.BASE_API_URL + '/workspace/groups/' + user.user_id + '/' + user.workspace_id);
  }

  @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  })
  getGroupsForUser(workspace: string) {
    return this._http.get(`${this.BASE_API_URL}/groups/user/${workspace}`);
  }

  @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  })
  getAgoras(): Observable<any> {
    return this._http.get<any>(`${this.BASE_API_URL}/groups/public/all`);
  }

  /**
   * Carries out an HTTP GET request that returns a
   * user's smart groups within a workspace.
   * 
   * @param workspace The workspace to search within.
   */
  @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  })
  getSmartGroups(workspace: string): Observable<any> {
    return this._http.get<any>(`${this.BASE_API_URL}/groups/smart/${workspace}`);
  }
}
