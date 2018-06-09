import { Injectable } from '@angular/core';

@Injectable()
export class GroupDataService {
  public _groupId;
  public _group: any;
  constructor() { }

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


}
