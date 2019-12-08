import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class TemplateService {

  private apiUrl = environment.BASE_API_URL;

  constructor(private http: HttpClient) { }


  public getTemplates(groupId: string): Observable<Array<ITemplate>> {
    return this.http.get<Array<ITemplate>>(`${this.apiUrl}/templates/${groupId}`);
  }

  public saveTemplate(template: ITemplate) {
    return this.http.post<ITemplate>(`${this.apiUrl}/templates`, template);
  }
}
