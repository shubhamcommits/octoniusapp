import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {SnotifyService} from 'ng-snotify';
import {GroupService} from '../../../../shared/services/group.service';
import {GroupDataService} from '../../../../shared/services/group-data.service';
import {Subject} from 'rxjs';
import {debounceTime} from 'rxjs/operators';
import {NgxUiLoaderService} from 'ngx-ui-loader';
import Swal from 'sweetalert2';
import {Location} from '@angular/common';
import {FormControl} from '@angular/forms'
import {environment} from "../../../../../environments/environment";

@Component({
  selector: 'app-group-admin',
  templateUrl: './group-admin.component.html',
  styleUrls: ['./group-admin.component.scss']
})
export class GroupAdminComponent implements OnInit {

  group;
  user_data;
  modalReference;
  itemList: any = [];
  selectedItems = [];
  settings = {};
  fileSharedCheck: boolean = false;
  staticAlertClosed = false;
  BASE_URL = environment.BASE_URL;

  private _message = new Subject<string>();
  alert = {
    class: '',
    message: ''
  };

  user: any;

  group_id;

  config = {
    displayKey: 'description', // if objects array passed which key to be displayed defaults to description,
    search: true // enables the search plugin to search in the list
  };
  dataModel;
  queryField: FormControl = new FormControl();

  constructor(private groupService: GroupService,
              public groupDataService: GroupDataService,
              private ngxService: NgxUiLoaderService,
              private router: Router,
              private snotifyServive: SnotifyService,
              private _location: Location) {
  }

  ngOnInit() {
    this.ngxService.start(); // start foreground loading with 'default' id
    this.user_data = JSON.parse(localStorage.getItem('user'));
    this.group_id = this.groupDataService.groupId;
    this.user = JSON.parse(localStorage.getItem('user_data'));
    this.alertMessageSettings();
    this.initSearch()
    this.loadGroup()
      .then(() => {
        this.ngxService.stop();
      })
      .then(() => {
        if (this.user && this.user.role === 'member') {
          setTimeout(() => {
            Swal.fire({
              type: 'info',
              title: 'You can\'t access this section!',
              text: 'Kindly contact your superior to update your role from member to admin.',
              showConfirmButton: true,
              allowEscapeKey: false,
              allowOutsideClick: false,
            }).then((result) => {
              if (result.value) {
                this._location.back();
              }
            });
          }, 1500);
        }
      })
      .then(() => {
        this.groupService.getGroupSharedFileCheck(this.group_id).subscribe(
          res => {
            if (res['sharedFilesBool']['share_files'] != null) {
              this.fileSharedCheck = res['sharedFilesBool']['share_files']
            }
          },
          err => {
            console.error(`Failed to get group file information! ${err}`);
          }
        );
      })
  }


  loadGroup() {
    return new Promise((resolve, reject) => {
      this.groupService.getGroup(this.group_id)
        .subscribe((res) => {
          this.group = res['group'];
          this.group.description = res['group']['description'];
          resolve();
        }, (err) => {
          reject(err);
        });
    })
  }

  alertMessageSettings() {
    setTimeout(() => this.staticAlertClosed = true, 20000);

    this._message.subscribe((message) => this.alert.message = message);
    this._message.pipe(
      debounceTime(3000)
    ).subscribe(() => this.alert.message = null);

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
    const data = {
      group: this.group_id,
      members: [item]
    };
    this.groupService.addMembersInGroup(data)
      .subscribe((res) => {
        this.selectedItems.push(item);
      }, (err) => {
        this.alert.class = 'danger';
        if (err.status) {
          this._message.next(err.error.message);
        } else {
          this._message.next('Error! either server is down or no internet connection');
        }

      });
  }

  memberJustAddedToGroup(item: any) {
    return this.selectedItems.includes(item);
  }

  // Makes a request to the backend to delete the current group
  onDelete() {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'

    }).then(willDelete => {
      if (willDelete.value) {
        console.log("willDelete", willDelete);
        this.groupService.deleteGroup(this.group_id).subscribe(
          res => {
            this.router.navigate(['/dashboard/groups']);
            setTimeout(() => {
              this.snotifyServive.success('Group successfully deleted!');
            }, 1500);
          },
          err => {
            console.error(`Failed to delete the group! ${err}`);
            this.snotifyServive.error('Failed to delete the group! Please try again later.');
          }
        );
      }
    });
  }

  onChange() {
    switch (this.fileSharedCheck) {
      case true:
        this.fileSharedCheck = false
        break;
      case false:
        this.fileSharedCheck = true
        break;

      default:
        break;
    }
    this.groupService.updateSharedFile(this.group_id, this.fileSharedCheck).subscribe(
      res => {
      },
      err => {
        console.error(`Failed to get group file information! ${err}`);
      }
    );
  }
}
