import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class GroupDataService {
  
  constructor() { }

  public _groupId;
  public _group: any;
  private groupData = new BehaviorSubject<any>({});
  currentGroupData = this.groupData.asObservable();

  set groupId(groupId) {
    this._groupId = groupId;
  }

  get groupId() {
    return this._groupId;
  }
  set group(group) {
    // console.log('Group in data group data service: ', group);

    this._group = group;
    // console.log('_group in data group data service: ', this._group);
  }

  get group() {
    return this._group;
  }

  sendGroupData(message: any) {
    this.groupData.next(message)
  }


}
