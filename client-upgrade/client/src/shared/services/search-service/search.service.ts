import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(
    private _http: HttpClient,
    private injector: Injector
  ) { }


  localURL: string = "http://localhost:8080/api/query-service";

  solrURL: string = "http://localhost:8983/solr/octonius"


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
