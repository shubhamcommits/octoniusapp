import { Component, OnInit } from '@angular/core';
import { Group } from '../../../../shared/models/group.model';
import { GroupDataService } from '../../../../shared/services/group-data.service';
import { GroupService } from '../../../../shared/services/group.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import Swal from 'sweetalert2';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../../../environments/environment';
@Component({
  selector: 'app-group-members',
  templateUrl: './group-members.component.html',
  styleUrls: ['./group-members.component.scss']
})
export class GroupMembersComponent implements OnInit {
  isUserAdmin;
  user_data;
  currentUserId;
  group_id;
  group_members;
  group_admins;
  isLoading$ = new BehaviorSubject(false);
  BASE_URL = environment.BASE_URL;

  constructor(private groupDataService: GroupDataService, private groupService: GroupService, private ngxService: NgxUiLoaderService) {
    this.user_data = JSON.parse(localStorage.getItem('user'));
   }

  ngOnInit() {

    this.ngxService.start(); // start foreground loading with 'default' id
 
    // Stop the foreground loading after 5s
    setTimeout(() => {
     // stop foreground loading with 'default' id
    }, 500);

    this.group_id = this.groupDataService.groupId;

    this.loadGroup()
    .then(()=>{
      this.ngxService.stop(); 
    })
    .catch((err)=>{
      console.log('Unexpected Error', err);
    })
  }


  loadGroup() {
    // console.log("this.user_data", this.user_data);
    this.currentUserId = this.user_data.user_id;
    this.isLoading$.next(true);
    return new Promise((resolve, reject)=>{
      this.groupService.getGroup(this.group_id)
      .subscribe((res) => {
        this.group_members = res['group']._members;
      //  console.log(this.group_members);
        this.group_admins = res['group']._admins;
        this.isUserAdmin = this.isAdmin();
        this.isLoading$.next(true);
        resolve();
      }, (err) => {
        console.log('Error while loading the group', err);
        this.isLoading$.next(false);
        reject(err);

      });
    })

  }

  isAdmin() {
   if(this.group_admins.length > 0){
     let userExistIndex = this.group_admins.findIndex((admin)=> admin._id === this.currentUserId);
     if (userExistIndex != -1){
       return true
     } else{
       return false;
     }
   } else if(this.group_members){
    let userExistIndex = this.group_members.findIndex((user)=> (user.role == 'owner' && user._id === this.currentUserId) ||(user.role == 'admin' && user._id === this.currentUserId));
    if (userExistIndex > -1){
      return true
    } else{
      return false;
    }
   }
  }

  removeUserfromGroup(user_id, first_name, last_name){
    const data = {
      'user_id':user_id,
      'group_id':this.groupDataService.groupId
  
    };
    Swal.fire({
      title: "Are you sure?",
      text: "You want to remove "+first_name+" "+last_name+" from the group?",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, please!'
    })
    .then(willDelete => {
      if (willDelete.value) {
        this.groupService.removeUserFromGroup(data)
        .subscribe((res) =>{
        //  console.log('Group Member is Removed!');
          this.loadGroup();
        });
        Swal.fire("Removed!", first_name+" "+last_name+", has been removed!", "success");
      }
    });
  }



}

