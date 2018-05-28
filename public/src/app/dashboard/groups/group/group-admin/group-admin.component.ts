import { Component, OnInit } from '@angular/core';
import { GroupService } from '../../../../shared/services/group.service';
import { FormControl } from '@angular/forms';
import { Workspace } from '../../../../shared/models/workspace.model';
import { GroupDataService } from '../../../../shared/services/group-data.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-group-admin',
  templateUrl: './group-admin.component.html',
  styleUrls: ['./group-admin.component.scss']
})
export class GroupAdminComponent implements OnInit {

  user_data;

  itemList: any = [];
  selectedItems = [];
  settings = {};

  staticAlertClosed = false;
  private _message = new Subject<string>();
  alert = {
    class: '',
    message: ''
  };

  group_id;

  config = {
    displayKey: 'description', // if objects array passed which key to be displayed defaults to description,
    search: true // enables the search plugin to search in the list
  };
  dataModel;
  constructor(private groupService: GroupService, private groupDataService: GroupDataService) { }

  ngOnInit() {
    this.user_data = JSON.parse(localStorage.getItem('user'));
    this.group_id = this.groupDataService.groupId;
    this.alertMessageSettings();
    this.inilizeWrokspaceMembersSearchForm();
  }


  alertMessageSettings() {
    setTimeout(() => this.staticAlertClosed = true, 20000);

    this._message.subscribe((message) => this.alert.message = message);
    this._message.pipe(
      debounceTime(3000)
    ).subscribe(() => this.alert.message = null);

  }


  inilizeWrokspaceMembersSearchForm() {

    this.settings = {
      text: 'Select Wrokspace Members',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      classes: 'myclass custom-class',
      primaryKey: '_id',
      labelKey: 'fullname',
      noDataLabel: 'Search Members...',
      enableSearchFilter: true,
      searchBy: ['fullname', 'capital']
    };
  }

  onAddNewMembers() {
    const data = {
      group: this.group_id,
      members: this.selectedItems
    };
    this.groupService.addMembersInGroup(data)
      .subscribe((res) => {
        console.log('add new user response:', res);
        this.selectedItems = [];
        this.alert.class = 'success';
        this._message.next(res['message']);

      }, (err) => {
        this.alert.class = 'danger';
        if (err.status) {
          this._message.next(err.error.message);
        } else {
          this._message.next('Error! either server is down or no internet connection');
        }

      });
  }

  onSearch(evt: any) {
    console.log(evt.target.value);
    this.itemList = [];

    this.groupService.searchWorkspaceUsers(evt.target.value, this.user_data.workspace._id)
      .subscribe((res) => {
        // console.log('workspace users: ', res);

        console.log(res);
        this.itemList = res['users'];

      }, (err) => {

      });

  }

  onItemSelect(item: any) {
    console.log(item);
    console.log('selected items: ', this.selectedItems);
  }
  OnItemDeSelect(item: any) {
    console.log(item);
    console.log(this.selectedItems);
  }
  onSelectAll(items: any) {
    console.log(items);
  }
  onDeSelectAll(items: any) {
    console.log(items);
  }

}
