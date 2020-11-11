import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class FlowService {
  constructor(private _http: HttpClient) { }

  baseURL = environment.GROUPS_BASE_API_URL;

  createNewAutomationFlow(groupId: string) {
    return this._http.post(this.baseURL + `/flows/addAutomationFlow`, { groupId: groupId }).toPromise()
  }

  deleteFlow(flowId) {
    return this._http.delete(this.baseURL + `/flows/${flowId}`).toPromise()
  }

  getGroupAutomationFlows(groupId: string) {
    return this._http.get(this.baseURL + `/flows/${groupId}/getAutomationFlows`).toPromise()
  }

  updateFlowName(flowId: string, flowName: string) {
    return this._http.put(this.baseURL + `/flows/updateFlowName`, { flowId: flowId, flowName: flowName }).toPromise()
  }

  getFlow(flowId: string) {
    return this._http.get(this.baseURL + `/flows/${flowId}`).toPromise()
  }

  removeFlowStep(stepId: string, flowId: string) {
    return this._http.put(this.baseURL + `/flows/removeFlowStep`, { stepId, flowId }).toPromise();
  }

  saveStep(flowId: string, step: any) {
    return this._http.put(this.baseURL + `/flows/${flowId}/step`, { step: step }).toPromise()
  }
}
