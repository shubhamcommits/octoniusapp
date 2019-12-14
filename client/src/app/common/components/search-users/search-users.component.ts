import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl} from "@angular/forms";
import {GroupService} from "../../../shared/services/group.service";
import {environment} from "../../../../environments/environment";
import {GroupDataService} from "../../../shared/services/group-data.service";
import {Subject} from "rxjs";

@Component({
  selector: 'app-search-users',
  templateUrl: './search-users.component.html',
  styleUrls: ['./search-users.component.scss']
})
export class SearchUsersComponent implements OnInit {

  @Input()
  addText = 'add';
  @Input()
  alreadyAdded = 'Added';
  @Input()
  joinedText = 'joined';

  @Output()
  userList: EventEmitter<object> = new EventEmitter();
  @Output()
  onUserSelect: EventEmitter<object> = new EventEmitter();

  queryField = new FormControl();
  user_data;
  itemList: any = [];
  selectedItems = [];
  BASE_URL = environment.BASE_URL;
  group;
  alert = {
    class: '',
    message: ''
  };
  group_id;
  private _message = new Subject<string>();

  constructor(private groupService: GroupService, private groupDataService: GroupDataService) {
  }

  ngOnInit() {
    this.group_id = this.groupDataService.groupId;
    this.user_data = JSON.parse(localStorage.getItem('user'));
    this.initSearch();
  }

  initSearch() {
    this.queryField.valueChanges
      .subscribe(queryValue => {
        if (this.isEmptyValue(queryValue)) {
          return;
        }
        this.groupService.searchWorkspaceUsers(queryValue, this.user_data.workspace._id)
          .subscribe((res) => {
            this.itemList = res['users'];
            this.selectedItems = [];
          })
      });
  }

  isEmptyValue(queryValue: any) {
    if (!queryValue || queryValue.trim() === '') {
      this.itemList = [];
      return true;
    }
    return false;
  }

  isGroupMember(item: any) {
    return item._groups.includes(this.group_id);
  }

  onAddNewMember(item: any) {
    // const data = {
    //   group: this.group_id,
    //   members: [item]
    // };
    // this.groupService.addMembersInGroup(data)
    //   .subscribe((res) => {
    //     this.selectedItems.push(item);
    //   }, (err) => {
    //     this.alert.class = 'danger';
    //     if (err.status) {
    //       this._message.next(err.error.message);
    //     } else {
    //       this._message.next('Error! either server is down or no internet connection');
    //     }
    //
    //   });

    this.onUserSelect.emit(item);

  }

  memberJustAddedToGroup(item: any) {
    return this.selectedItems.includes(item);
  }

}
