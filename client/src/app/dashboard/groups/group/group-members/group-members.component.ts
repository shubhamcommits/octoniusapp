import { Component, OnInit } from '@angular/core';
import { Group } from '../../../../shared/models/group.model';
import { GroupDataService } from '../../../../shared/services/group-data.service';
import { GroupService } from '../../../../shared/services/group.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import Swal from 'sweetalert2';
import { BehaviorSubject } from 'rxjs';
@Component({
  selector: 'app-group-members',
  templateUrl: './group-members.component.html',
  styleUrls: ['./group-members.component.scss']
})
export class GroupMembersComponent implements OnInit {
  group_id;
  group_members;
  group_admins;
  isLoading$ = new BehaviorSubject(false);


  constructor(private groupDataService: GroupDataService, private groupService: GroupService, private ngxService: NgxUiLoaderService) { }

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
    this.isLoading$.next(true);
    return new Promise((resolve, reject)=>{
      this.groupService.getGroup(this.group_id)
      .subscribe((res) => {
        this.group_members = res['group']._members;
      //  console.log(this.group_members);
        this.group_admins = res['group']._admins;
        this.isLoading$.next(true);
      //  console.log(this.group_admins);
        resolve();
      }, (err) => {
        console.log('Error while loading the group', err);
        this.isLoading$.next(false);
        reject(err);

      });
    })

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
      if (willDelete) {
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

