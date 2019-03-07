import * as moment from 'moment';
import * as io from 'socket.io-client';
import {Component, OnInit, ViewChild, ViewChildren} from '@angular/core';
import { ActivatedRoute, Router, Route } from '@angular/router';
import { NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PostService } from '../../../../shared/services/post.service';
import { GroupService } from '../../../../shared/services/group.service';
import { GroupDataService } from '../../../../shared/services/group-data.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { debounceTime } from 'rxjs/operators';

import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { User } from '../../../../shared/models/user.model';
import { UserService } from '../../../../shared/services/user.service';
import { saveAs } from 'file-saver';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnotifyService, SnotifyPosition, SnotifyToastConfig } from 'ng-snotify';
import { NgbPopoverConfig } from '@ng-bootstrap/ng-bootstrap';
import { ScrollToService } from 'ng2-scroll-to-el';
import 'quill-mention';
import { environment } from '../../../../../environments/environment';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
declare var gapi: any;
declare var google: any;
import {Group} from "../../../../shared/models/group.model";
import { QuillAutoLinkService } from '../../../../shared/services/quill-auto-link.service';
import {months} from "../../../../common/data";

import * as Quill from 'quill';
(window as any).Quill = Quill;
import 'quill-emoji/dist/quill-emoji';
import { GoogleCloudService } from '../../../../shared/services/google-cloud.service';
import {GroupActivityFiltersComponent} from "./group-activity-filters/group-activity-filters.component";


@Component({
  selector: 'app-group-activity',
  templateUrl: './group-activity.component.html',
  styleUrls: ['./group-activity.component.scss'],
  providers: [NgbPopoverConfig, NgbDropdownConfig]
})

export class GroupActivityComponent implements OnInit {

  @ViewChild(GroupActivityFiltersComponent) groupActivityFiltersComponent;

  /* It Stores all the Posts of a group into this array*/
  posts = [];
  comments = [];
  /* It Stores the Group data of a group*/
  group_id;
  group: Group;
  group_name;
  group_socket_id;

  /*Initiating socket and related data*/
  socket = io(environment.BASE_URL);
  BASE_URL = environment.BASE_URL;
  show_new_posts_badge = 0;

  members = [];
  allMembersId = [];
  files = [];
  content_mentions = [];

  isLoading$ = new BehaviorSubject(false);

  user_data;
  user: User;
  profileImage;

  // group user search variabels
  config = {
    displayKey: 'description', // if objects array passed which key to be displayed defaults to description,
    search: false // enables the search plugin to search in the list
  };
  groupUsersList: any = [];
  selectedGroupUsers = [];
  settings = {};

  googleDriveFiles = [];

  modules;
  modulesLoaded = false;

  isItMyWorkplace = false;

  constructor(private _activatedRoute: ActivatedRoute, private _router: Router, private _userService: UserService,
              public groupDataService: GroupDataService, private router: Router, private groupService: GroupService,
              private modalService: NgbModal, private postService: PostService, private _sanitizer: DomSanitizer,
              private ngxService: NgxUiLoaderService, private snotifyService: SnotifyService, config: NgbDropdownConfig,
              private scrollService: ScrollToService, private quillInitializeService: QuillAutoLinkService,
              private googleService: GoogleCloudService) {

    config.placement = 'left';
    config.autoClose = false;
    this.group_id = this.groupDataService.groupId;
    this.user_data = JSON.parse(localStorage.getItem('user'));
  }

  async ngOnInit() {
    this.ngxService.start();

    setTimeout(() => {
      this.ngxService.stop();
    }, 500);

    // here we test if the section we entered is a group of my personal workplace
    this.isItMyWorkplace = this._activatedRoute.snapshot.queryParamMap.get('myworkplace') == 'true' || false;

    this.getUserProfile();

    // initial group data;
    this.group_id = this.groupDataService.groupId;
    this.group_name = this.group ? this.group.group_name : null;

    // my-workplace depends on a private group and we need to fetch that group and edit
    // the group data before we proceed and get the group posts
    if (this.isItMyWorkplace) {
      await this.getPrivateGroup();
    } else {
      // group needs to be defined
      await this.getGroup();
    }

    // we have set a time interval of 30mins so as to refresh the access_token in the group
    setInterval(() => {
      this.googleService.refreshGoogleToken();
    }, 1800000);

    this.loadGroupPosts();

    this.initializeGroupMembersSearchForm();
    this.mentionmembers();
    this.socketio();
  }

  addNewPostToPosts(post) {
    this.posts.unshift(post);
    this.snotifyService.success('Successfully added post');
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
          this.postService.deletePost(postId)
            .subscribe((res) => {
              // snackbar displaying when successfully deleted post
              this.snotifyService.success('Successfully deleted post');

              //  mirror front-end to back-end to delete post
              const indexDeletedPost = this.posts.findIndex((post) => post._id == postId);
              this.posts.splice(indexDeletedPost, 1);
            }, (err) => {

              if (err.status) {
                this.snotifyService.error(err.error.message);
              } else {
                this.snotifyService.error('Error! either server is down or no internet connection');
              }
            });
        }
      });
  }

  filterPosts(filteredPosts) {
    this.isLoading$.next(false);
    this.ngxService.stopBackground();

    this.posts = filteredPosts;
  }

  transform(html: string): SafeHtml {
    return this._sanitizer.bypassSecurityTrustHtml(html);
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

  playAudio() {
    this.postService.playAudio();
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

      // Alert on screen when newPost is created
      this.socket.on('newPostOnGroup', (data) => {
        if (this.group_id == data.groupId) {
          this.show_new_posts_badge = 1;
          this.playAudio();
        }
      });

      this.socket.on('disconnect', () => {
        //	console.log(`Socket disconnected from group`);
      });
  }



  navigate_to_group(group_id) {
    window.location.href = this.BASE_URL + '#/dashboard/group/' + group_id + '/activity';
  }

  getUserProfile() {
    this._userService.getUser()
      .subscribe((res) => {
        this.user = res.user;
        this.profileImage = res.user['profile_pic'];
        this.profileImage = this.BASE_URL + `/uploads/${this.profileImage}`;
      }, (err) => {
        if (err.status === 401) {
          this.snotifyService.error(err.error.message);
          setTimeout(() => {
            localStorage.clear();
            this._router.navigate(['']);
          }, 3000);
        } else if (err.status) {
          this.snotifyService.error(err.error.message);
        } else {
          this.snotifyService.error('Error! either server is down or no internet connection');
        }
      });
  }

  // group memebrs search setting when user add new event or taks type post
  initializeGroupMembersSearchForm() {
    this.settings = {
      text: 'Select Group Members',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      classes: 'myclass custom-class',
      primaryKey: '_id',
      labelKey: 'full_name',
      noDataLabel: 'Search Members...',
      enableSearchFilter: true,
      searchBy: ['full_name', 'capital']
    };
  }


  linkify(text) {
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlRegex, function (url) {
      return '<a href="' + url + '">' + url + '</a>';
    });
  }


  // !--FETCH DATA OF SINGLE COMMENT--! //
  getSingleComment(commentId){
    this.postService.getComment(commentId)
      .subscribe((res) => {

      }, (err) => {
        swal("Error!", "Error while fetching the comment " + err, "danger");
      });
  }
  // !--FETCH DATA OF SINGLE COMMENT--! //

  getPrivateGroup() {
    return new Promise((resolve, reject) => {

      this.groupService.getPrivateGroup()
        .subscribe((res) => {


          this.group = res['privateGroup'];
          this.group_id = res['privateGroup']['_id'];
          this.group_name = res['privateGroup']['group_name'];
          resolve();
        }, (err) => {
          reject(err);
        })
    })
  }


  // !--LOAD ALL THE GROUP POSTS ON INIT--! //
  loadGroupPosts() {
    this.isLoading$.next(true);

      this.postService.getGroupPosts(this.group._id)
        .subscribe((res) => {
          this.posts = res['posts'];
          this.isLoading$.next(false);
          this.show_new_posts_badge = 0;
        }, (err) => {
          this.snotifyService.error("Error while retrieving the posts", "Error!");
        });
  }
  // !--LOAD ALL THE GROUP POSTS ON INIT--! //



  // !--LOAD ALL THE NEXT MOST RECENT GROUP POSTS--! //
  loadNextPosts(last_post_id) {
    this.isLoading$.next(true);

    this.postService.getNextPosts(this.group_id, last_post_id)
      .subscribe((res) => {
        this.posts = this.posts.concat(res['posts']);
        this.isLoading$.next(false);
      }, (err) => {
        this.snotifyService.error('Error while retrieving the next recent posts', 'Error!');
      });
  }
  // !--LOAD ALL THE NEXT MOST RECENT GROUP POSTS--! //



  // !--ON SCROLL FETCHES THE NEXT RECENT GROUP POSTS--! //
  onScroll(event, el) {
    if ( this.posts.length != 0 ) {
      // if one of the filters is active we get the next FILTERED posts
      if (
        this.groupActivityFiltersComponent.filters.normal
        || this.groupActivityFiltersComponent.filters.event
        || this.groupActivityFiltersComponent.filters.task
        || (this.groupActivityFiltersComponent.filters.user && !!this.groupActivityFiltersComponent.filters.user_value)) {
        this.isLoading$.next(true);
        this.ngxService.startBackground();
        this.groupActivityFiltersComponent.getNextFilteredPosts();
      //  Else we get the normal next posts
      } else {
        this.isLoading$.next(true);
        this.ngxService.startBackground();
        this.postService.getGroupPosts(this.group_id)
          .subscribe((res) => {
            if (this.posts.length !== 0) {

              const last_post_id = this.posts[this.posts.length - 1]._id;
              this.loadNextPosts(last_post_id);
              this.isLoading$.next(false);
              this.ngxService.stopBackground();
            }
          }, (err) => {
            this.snotifyService.error('Error while retrieving the next recent posts', 'Error!');
          });
      }
    }

  }
  // !--ON SCROLL FETCHES THE NEXT RECENT GROUP POSTS--! //



  // !--SCROLL TO AN ELEMENT--! //
  scrollToTop(element) {
    this.scrollService.scrollTo(element).subscribe();
  }
  // !--SCROLL TO AN ELEMENT--! //


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
    this.modulesLoaded = true;
  }
}
