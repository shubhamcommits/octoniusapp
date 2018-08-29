import { Component, OnInit } from '@angular/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { PostService } from '../../../../shared/services/post.service'; 
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { GroupService } from '../../../../shared/services/group.service';
import { GroupDataService } from '../../../../shared/services/group-data.service';
import { environment } from '../../../../../environments/environment';
import { User } from '../../../../shared/models/user.model';
import { UserService } from '../../../../shared/services/user.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-group-files',
  templateUrl: './group-files.component.html',
  styleUrls: ['./group-files.component.scss']
})
export class GroupFilesComponent implements OnInit {

  group_id;
  groupImageUrl = '';
  posts = new Array();

  group = {
    description: ''
  };

  isLoading$ = new BehaviorSubject(false);

  constructor(private ngxService: NgxUiLoaderService, private postService: PostService,
    public groupDataService: GroupDataService, private groupService: GroupService,private _userService: UserService) { }

  ngOnInit() {
    this.ngxService.start(); // start foreground loading with 'default' id
 
    // Stop the foreground loading after 5s
    setTimeout(() => {
      this.ngxService.stop(); // stop foreground loading with 'default' id
    }, 500);

    this.group_id = this.groupDataService.groupId;
    this.loadGroupPosts();
  }

  loadGroupPosts() {

    this.isLoading$.next(true);

    this.postService.getGroupPosts(this.group_id)
      .subscribe((res) => {
        // console.log('Group posts:', res);
        this.posts = res['posts'];
       console.log('Group posts:', this.posts);
       this.isLoading$.next(false);


      }, (err) => {

      });

  }

  onDownlaodFile(fileName, fileName_orignal) {

    const fileData = {
      'fileName': fileName
    };
    this._userService.downloadFile(fileData)
      .subscribe((file) => {

        //   console.log('Downloaded File', file);
        saveAs(file, fileName_orignal);

      }, (err) => {
        console.log('Downloaded File err', err);

      });
  }

  loadGroup() {
    this.groupService.getGroup(this.group_id)
      .subscribe((res) => {
        console.log('Group: ', res);
        if (res['group']['group_avatar'] == null) {
          console.log('Inside if: ', this.groupImageUrl);

          this.groupImageUrl = '/assets/images/group.png';
        } else {
          this.groupImageUrl = environment.BASE_URL + `/uploads/${res['group']['group_avatar']}`;

        }

        this.group.description = res['group']['description'];

      }, (err) => {

        console.log('err: ', err);

      });

  }

}
