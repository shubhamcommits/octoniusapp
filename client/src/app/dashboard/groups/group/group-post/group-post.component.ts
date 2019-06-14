import {Component, OnInit, ViewChild} from '@angular/core';
import * as moment from 'moment';
import { PostService } from '../../../../shared/services/post.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { InputValidators } from '../../../../common/validators/input.validator';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { GroupService } from '../../../../shared/services/group.service';
import { GroupDataService } from '../../../../shared/services/group-data.service';
import { environment } from '../../../../../environments/environment';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbPopoverConfig } from '@ng-bootstrap/ng-bootstrap';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

declare var gapi: any;
declare var google: any;
import * as io from 'socket.io-client';

import * as Quill from 'quill';
import { QuillAutoLinkService } from '../../../../shared/services/quill-auto-link.service';
(window as any).Quill = Quill;
import 'quill-emoji/dist/quill-emoji';
import { UserService } from '../../../../shared/services/user.service';

import {Group} from "../../../../shared/models/group.model";

import { GoogleCloudService } from '../../../../shared/services/google-cloud.service';

@Component({
  selector: 'app-group-post',
  templateUrl: './group-post.component.html',
  styleUrls: ['./group-post.component.scss'],
  providers: [NgbPopoverConfig, NgbDropdownConfig]
})
export class GroupPostComponent implements OnInit {

  user_data;

  user: any;
  profileImage: any;

  group: Group;

  isItMyWorkplace = false;

  post;
  postId;

  socket = io(environment.BASE_URL);
  group_name;

  showComments = {
    id: '',
    normal: false,
    event: false,
    task: false
  };
  comment = {
    content: '',
    _commented_by: '',
    post_id: '',
    _content_mentions: []
  };
  commentForm;
  commentCount: number;

  group_id;

  BASE_URL = environment.BASE_URL;

  comments = [];

  allMembersId = [];

  members = [];

  files = [];

  content_mentions = [];

  selectedGroupUsers = [];

  groupUsersList: any =[];

  settings = {};

  getPostLikedBy: any = new Array();

  model_date;
  model_time = { hour: 13, minute: 30 };
  assignment = 'Unassigned';

  datePickedCount = 0;
  timePickedCount = 0;

  modules = {};

  @ViewChild('commentEditor', { static: false }) commentEditor;


  // !--GOOGLE DEVELOPER CONSOLE CREDENTIALS--! //
  developerKey = 'AIzaSyDGM66BZhGSmBApm3PKL-xCrri-3Adb06I';

  clientId = "971238950983-aef7kjl23994hjj9e8m5tch4a22b5dut.apps.googleusercontent.com";

  scope = [
    'https://www.googleapis.com/auth/drive'//insert scope here
  ].join(' ');

  pickerApiLoaded = false;

  oauthToken?: any;
  // !--GOOGLE DEVELOPER CONSOLE CREDENTIALS--! //


  constructor(private ngxService: NgxUiLoaderService, private postService: PostService,
    private groupService: GroupService, private _activatedRoute: ActivatedRoute, private _userService: UserService,
    public groupDataService: GroupDataService ,private quillInitializeService: QuillAutoLinkService, private modalService: NgbModal
    , private _router: Router, private googleService: GoogleCloudService) {
    this.postId = this._activatedRoute.snapshot.paramMap.get('postId');
    this.user_data = JSON.parse(localStorage.getItem('user'));
    this.group_id = this._activatedRoute.snapshot['_urlSegment']['segments'][2].path;


    //this.ngOnInit();
   }

  async ngOnInit() {
    this._router.routeReuseStrategy.shouldReuseRoute = function(){
      return false;
    };

    this._router.events.subscribe((evt) => {
        if (evt instanceof NavigationEnd) {
            this._router.navigated = false;
            window.scrollTo(0, 0);
        }
    });
    this.model_date = {year: (new Date()).getFullYear(), month: (new Date()).getMonth() + 1, day: (new Date()).getDate()};
    this.ngxService.start(); // start foreground loading with 'default' id

      // here we test if the section we entered is a group of my personal workplace
    this.isItMyWorkplace = this._activatedRoute.snapshot.queryParamMap.get('myworkplace') == 'true' || false;
  
    this.getUserProfile();

        // initial group data;
    this.group_id = this.groupDataService.groupId;
    this.group_name = this.group ? this.group.group_name : null;

    if (this.isItMyWorkplace) {
      await this.getPrivateGroup();
    } else {
      // group needs to be defined
      await this.getGroup();
    }

    setInterval(() => {
      this.googleService.refreshGoogleToken();
    }, 1800000);

    this.getPost(this.postId)
    .then(()=>{
      this.ngxService.stop();
    })
    .catch((err)=>{
      console.log('Unexpected Error', err);
    })
    this.mentionmembers();
    this.socketio();
  }

  getPost(postId) {
    return new Promise((resolve, reject)=>{
      this.postService.getPost(postId)
      .subscribe((res) => {
        this.post = res['post'];
        // we set the original comment count
        this.commentCount = res['post'].comments.length;
        this.comments = res['post'].comments;
        resolve();

      }, (err)=>{
        swal("Error!", "Error received while fetching the post " + err, "danger");
        reject(err);
      });
    })


  }

  getGroup () {
    // we need the group before we can proceed
    return new Promise((resolve, reject) => {
      this.groupService.getGroup(this.group_id)
        .subscribe((res) => {
          // console.log('response in group component:', res);
          this.group = res['group'];
          this.group_name = res['group']['group_name'];
          resolve();
        }, (err) => {
          reject();
        });
    });
  }

  getPrivateGroup() {
    return new Promise((resolve, reject) => {

      this.groupService.getPrivateGroup()
        .subscribe((res) => {
          console.log(res);
          this.group = res['privateGroup'];
          this.group_id = res['privateGroup']['_id'];
          this.group_name = res['privateGroup']['group_name'];
          resolve();
        }, (err) => {
          reject(err);
        })
    })
  }

  socketio() {
    const room = {
      workspace: this.user_data.workspace.workspace_name,
      group: this.group_name,
    };

    // join room to get notifications for this group
    this.socket.emit('joinGroup', room, (err) => {
      console.log(`Socket Joined`);
    });

    this.socket.on('disconnect', () => {
      //	console.log(`Socket disconnected from group`);
    });
}

  onDeletePost(postId) {
      swal({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        dangerMode: true,
        buttons: ["Cancel", "Yes, delete it!"],

      })
        .then(willDelete => {
          if (willDelete) {
            swal("Deleted!", "The following post has been deleted!", "success");
            this._router.navigate(['/dashboard/group', this.group_id, 'activity']);
          }
        });

      this.postService.deletePost(postId)
        .subscribe((res) => {
          const data = {
            postId,
            workspace: this.user_data.workspace.workspace_name,
            group: this.group.group_name,
            type: 'post'
          };

          this.socket.emit('postDeleted', data);
        })

    }



  mentionmembers() {
      let hashValues = [];
  
      let Value = [];
  
      let driveValue = [];
  
      this.groupService.getGroup(this.group_id)
        .subscribe((res) => {
          Value.push({ id: '', value: 'all' });
  
          for (let i = 0; i < res['group']._members.length; i++) {
            this.members.push(res['group']._members[i].first_name + ' ' + res['group']._members[i].last_name);
            this.allMembersId.push(res['group']._members[i]._id);
            Value.push({ id: res['group']._members[i]._id, value: res['group']._members[i].first_name + ' ' + res['group']._members[i].last_name });
          }
          for (var i = 0; i < res['group']._admins.length; i++) {
            this.members.push(res['group']._admins[i].first_name + ' ' + res['group']._admins[i].last_name);
            this.allMembersId.push(res['group']._admins[i]._id);
            Value.push({ id: res['group']._admins[i]._id, value: res['group']._admins[i].first_name + ' ' + res['group']._admins[i].last_name });
          }
        });
  
      this.groupService.getGroupFiles(this.group_id)
        .subscribe((res) => {
          this.files = res['posts'];
          for (let i = 0; i < res['posts'].length; i++) {
            if (res['posts'][i].files.length > 0) {
              hashValues.push({ id: res['posts'][i].files[0]._id, value: '<a style="color:inherit;" target="_blank" href="' + this.BASE_URL + '/uploads/' + res['posts'][i].files[0].modified_name + '"' + '>' + res['posts'][i].files[0].orignal_name + '</a>' })
            }
          }
        }, (err) => {
        });
  
  
      const toolbaroptions = {
        container: [
          ['bold', 'italic', 'underline', 'strike'],     // toggled buttons
          ['blockquote', 'code-block'],
  
          [{ 'header': 1 }, { 'header': 2 }],               // custom button values
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
          [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
          [{ 'direction': 'rtl' }],                         // text direction
  
          // [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  
          [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
          [{ 'font': [] }],
          [{ 'align': [] }],
  
          ['clean'],                                        // remove formatting button
  
          ['link', 'image', 'video'],
          ['emoji']],
        handlers: {
          'emoji': function () {
            console.log('clicked');
          },
          'image': function () {
            //Creates an element which accepts image file as the input
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.click();
  
            // Listen upload local image and save to server
            input.onchange = () => {
              const file = input.files[0];
              const range = this.quill.getSelection();
              const text = '\nImage is being uploaded, please wait...';
              var length = this.quill.getLength();
              var currentIndex = this.quill.getSelection().index;
              this.quill.insertText(range.index, text, 'bold', true);
  
              // file type is only image.
              if (/^image\//.test(file.type)) {
                //here we are calling the upload Image API, which saves the image to server
                const fd = new FormData();
                fd.append('attachments', file);
  
                //Calling Custom XML HTTP REQUEST
                const xhr = new XMLHttpRequest();
  
                xhr.open('POST', environment.BASE_API_URL+'/posts/upload', true);
                xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
  
                xhr.onload = () => {
                  if (xhr.status === 200) {
                    // this is callback data: url
                    const url = JSON.parse(xhr.responseText).file[0].modified_name;
  
                    //Here we insert the image and replace the BASE64 with our custom URL, which is been saved to the server
                    //ex - img src = "http://localhost:3000/uploads/image-name.jpg"
                    const range = this.quill.getSelection();
                    this.quill.insertEmbed(range.index, 'image', environment.BASE_URL+'/uploads/'+url);
                    //console.log(this.quill.getLength(), text.length, range.index);
  
                    //here we delete the uploading text from the editor
                    this.quill.deleteText(currentIndex, text.length);
  
                  }
                };
                xhr.send(fd);
              } else {
                console.warn('You could only upload images.');
              }
            };
  
          }
        }
      };
  
      this.modules = {
        toolbar: toolbaroptions,
        "emoji-toolbar": true,
        "emoji-shortname": true,
        autoLink: true,
        mention: {
          allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
          mentionDenotationChars: ["@", "#"],
          source: function (searchTerm, renderList, mentionChar) {
            let values;
            if (mentionChar === "@") {
              values = Value;
            } else if(mentionChar === "#") {
  
  
              if(localStorage.getItem('google-cloud-token') != null) {
                const getDriveFiles: any = new XMLHttpRequest();
  
                getDriveFiles.open('GET', 'https://www.googleapis.com/drive/v2/files?q=fullText contains '+'"'+searchTerm+'"'+'&maxResults=10&access_token='+JSON.parse(localStorage.getItem('google-cloud-token')).google_token_data.access_token, true);
                getDriveFiles.setRequestHeader('Authorization', 'Bearer ' + JSON.parse(localStorage.getItem('google-cloud-token')).google_token_data.access_token);
  
                getDriveFiles.onload = () => {
                  if (getDriveFiles.status === 200) {
                    for(var i = 0; i < JSON.parse(getDriveFiles.responseText).items.length; i++ ){
                      if( JSON.parse(getDriveFiles.responseText).items.length>0){
                        hashValues.push({
                          //the id has been put manually, it is in no relation to the g-drive files, if you have any better solution to propose, then do make the changes
                          // it is accepting only ObjectId type data
                          // g-drive is giving a different ID type, please suggest the solution
                          id: '5b9649d1f5acc923a497d1da',
                          value: '<a style="color:inherit;" target="_blank" href="'+JSON.parse(getDriveFiles.responseText).items[i].embedLink + '"' + '>'+ JSON.parse(getDriveFiles.responseText).items[i].title + '</a>'
                        });
                      }
                    }
                  }
                };
                getDriveFiles.send();
              }
              values = hashValues;
            }
  
            if (searchTerm.length === 0) {
              renderList(values, searchTerm);
            } else {
              const matches = [];
              for (var i = 0; i < values.length; i++)
                if (~values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())) matches.push(values[i]);
              renderList(matches, searchTerm);
            }
          }
        },
      };
    }


  getUserProfile() {
    this._userService.getUser()
      .subscribe((res) => {
        this.user = res.user;
        this.profileImage = res.user['profile_pic'];
        this.profileImage = this.BASE_URL + `/uploads/${this.profileImage}`;
      }, (err) => {
        console.log('Error fetched while getting user', err);
      });
  }

}
