import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class TemplateService {

  constructor(private http: HttpClient) { }


  public getTemplates(groupId: string) {

  }

  public saveTemplate(template: ITemplate, groupId: string) {

  }
}
