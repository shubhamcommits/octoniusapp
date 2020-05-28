import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(
    private _http: HttpClient,
    private injector: Injector
  ) { }


  localURL: string = environment.QUERY_SERVICE_BASE_API_URL;

  solrURL: string = environment.QUERY_SERVICE_MONITOR_URL


  searchPostById(id: any){
    return this._http.get(this.localURL + `/post/${id}`).toPromise();
  }

  searchPostByQuery(request: any){
    return this._http.post(this.localURL + '/post', request).toPromise();
  }

  searchUserByQuery(request: any){
    return this._http.post(this.localURL + '/user', request).toPromise();
  }

  searchFileByQuery(request: any){
    return this._http.post(this.localURL + '/file', request).toPromise();
  }
}
