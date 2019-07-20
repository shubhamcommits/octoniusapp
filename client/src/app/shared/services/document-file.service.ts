import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable()
export class DocumentFileService {

  BASE_API_URL = environment.BASE_API_URL;

  constructor(private _http: HttpClient) { }

  getDocumentFile(postId){
    return this._http.get(this.BASE_API_URL + `/documentFiles/${postId}`);
  }

  createDocumentFile(documentFileData){
    return this._http.post(this.BASE_API_URL + `/documentFiles/`, documentFileData);
  }

  editDocumentFile(postId, documentFileData){
    return this._http.put(this.BASE_API_URL + `/documentFiles/${postId}`, documentFileData);
  }

  getFiles(groupId){
    return this._http.get(this.BASE_API_URL + `/documentFiles/group/${groupId}`);
  }
}
