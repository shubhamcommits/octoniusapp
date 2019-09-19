import * as moment from 'moment';
import io from 'socket.io-client';
import {Component, OnInit, ViewChild, ViewChildren} from '@angular/core';
import { ActivatedRoute, Router, Route, NavigationEnd } from '@angular/router';
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
import Mention from 'quill-mention';
import { environment } from '../../../../../environments/environment';
import { NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';
declare var gapi: any;
declare var google: any;
import {Group} from "../../../../shared/models/group.model";
import { QuillAutoLinkService } from '../../../../shared/services/quill-auto-link.service';
import {months} from "../../../../common/data";
import Swal from 'sweetalert2';
import { MentionBlot } from '../../../../shared/utils/mention-module/quill.mention.blot';
import * as Quill from 'quill';
(window as any).Quill = Quill;
import 'quill-emoji/dist/quill-emoji';
import { GoogleCloudService } from '../../../../shared/services/google-cloud.service';
import {GroupActivityFiltersComponent} from "./group-activity-filters/group-activity-filters.component";
import { NgxSpinnerService } from 'ngx-spinner';
import { DocumentFileService } from '../../../../shared/services/document-file.service';

import ImageResize from 'quill-image-resize-module';
import { ImageDrop } from 'quill-image-drop-module';
import { ImageFormat } from '../../../../shared/utils/image-format/base-image-format';

Quill.register(MentionBlot);
Quill.register('modules/mention', Mention);
Quill.register('modules/imageResize', ImageResize);
Quill.register('modules/imageDrop', ImageDrop);
Quill.register(ImageFormat, true);

@Component({
  selector: 'app-group-activity',
  templateUrl: './group-activity.component.html',
  styleUrls: ['./group-activity.component.scss'],
  providers: [NgbPopoverConfig, NgbDropdownConfig]
})

export class GroupActivityComponent implements OnInit {

  @ViewChild(GroupActivityFiltersComponent, { static: true }) groupActivityFiltersComponent;

  /* It Stores all the Posts of a group into this array*/
  posts = [];
  comments = [];
  /* It Stores the Group data of a group*/
  group_id;
  pulse_description;
  group: Group;
  group_name;
  group_socket_id;

  /*Initiating socket and related data*/
  socket = io(environment.BASE_URL, {
    path: '/socket.io',
    transports: ['websocket'],
    secure: true,
  });
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
  mentionValues:any = [];

  modules;
  modulesLoaded = false;

  isItMyWorkplace = false;

  constructor(private _activatedRoute: ActivatedRoute, private _router: Router, private _userService: UserService,
              public groupDataService: GroupDataService, private router: Router, private groupService: GroupService,
              private modalService: NgbModal, private postService: PostService, private _sanitizer: DomSanitizer,
              private ngxService: NgxUiLoaderService, private snotifyService: SnotifyService, config: NgbDropdownConfig,
              private scrollService: ScrollToService, private quillInitializeService: QuillAutoLinkService,
              private googleService: GoogleCloudService, private spinner: NgxSpinnerService,
              private documentFileService: DocumentFileService,) {

    config.placement = 'left';
    config.autoClose = false;
    this.group_id = this.groupDataService.groupId;
    this.user_data = JSON.parse(localStorage.getItem('user'));
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

    this.ngxService.start();

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

    this.loadGroupPosts().then(()=>{
      this.ngxService.stop();
    });

    this.initializeGroupMembersSearchForm();
    this.mentionmembers();
    this.socketio();
  }

  addNewPostToPosts(post) {
    this.posts.unshift(post);
    this.snotifyService.success('Post created');
  }

  onDeletePost(postId) {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    })
      .then(willDelete => {
        if (willDelete.value) {
          this.postService.deletePost(postId)
            .subscribe((res) => {
              // snackbar displaying when successfully deleted post
              this.snotifyService.warning('Post deleted');

              //  mirror front-end to back-end to delete post
              const indexDeletedPost = this.posts.findIndex((post) => post._id == postId);
              this.posts.splice(indexDeletedPost, 1);

              const data = {
                postId,
                workspace: this.user_data.workspace.workspace_name,
                group: this.group.group_name,
                type: 'post'
              };

              this.socket.emit('postDeleted', data);

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
    //this.spinner.hide();
    this.ngxService.stopBackground();

    //this.posts = filteredPosts;
    this.posts = this.postService.removeDuplicates(filteredPosts, '_id');
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

  editPulseDesc() {
    const pulse_description_data = {
      pulse_description: this.pulse_description,
    };
    return new Promise((resolve, reject) => {
      this.groupService.editPulseDesc(this.group_id, pulse_description_data)
        .subscribe((res) => {
          console.log('response in group editPulseDesc:', res);
          this.pulse_description = null;
          this.snotifyService.success('New Pulse Sent!');
          resolve();
        }, (err) => {
          console.log(reject);
          console.log(pulse_description_data);
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
        //console.log(`Socket Joined`);
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
      .subscribe(async (res) => {
        this.user = await res.user;
        this.profileImage = await res.user['profile_pic'];
        this.profileImage = await this.BASE_URL + `/uploads/${this.profileImage}`;
        localStorage.setItem('user_data', JSON.stringify(res.user));
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
        Swal.fire("Error!", "Error while fetching the comment " + err, "error");
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
    return new Promise((resolve, reject)=>{
      this.isLoading$.next(true);
      this.ngxService.startBackground();
      //this.spinner.show();

      this.postService.getGroupPosts(this.group._id)
        .subscribe((res) => {
          //this.posts = res['posts'];
          this.posts = this.postService.removeDuplicates(res['posts'], '_id');
          //console.log(this.posts);
          this.isLoading$.next(false);
          this.ngxService.stopBackground();
          //this.spinner.hide();
          this.show_new_posts_badge = 0;
          resolve();
        }, (err) => {
          this.snotifyService.error("Error while retrieving the posts", "Error!");
          reject(err);
        });
    })

  }
  // !--LOAD ALL THE GROUP POSTS ON INIT--! //



  // !--LOAD ALL THE NEXT MOST RECENT GROUP POSTS--! //
  loadNextPosts(last_post_id) {
    this.isLoading$.next(true);
    //this.spinner.show();
    this.ngxService.startBackground();

    this.postService.getNextPosts(this.group_id, last_post_id)
      .subscribe((res) => {
        //this.posts = this.posts.concat(res['posts']);
        this.posts = this.postService.removeDuplicates([...this.posts, ...res['posts']], '_id');
        //this.posts = [...this.posts, ...res['posts']];
        this.isLoading$.next(false);
        this.ngxService.stopBackground();
        //this.spinner.hide();
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
        //this.spinner.show();
        //this.ngxService.startBackground();
        this.groupActivityFiltersComponent.getNextFilteredPosts();
      //  Else we get the normal next posts
      } else {
        this.isLoading$.next(true);
        //this.spinner.show();
        this.ngxService.startBackground();
        this.postService.getGroupPosts(this.group_id)
          .subscribe((res) => {
            if (this.posts.length !== 0) {

              const last_post_id = this.posts[this.posts.length - 1]._id;
              this.loadNextPosts(last_post_id);
              this.isLoading$.next(false);
              //this.spinner.hide();
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
      this.groupService.getAllSharedGroupFiles(this.group_id,this.user_data.workspace._id,this.user_data.user_id)
        .subscribe((res) => {
          if(hashValues.length != 0){
            hashValues.concat(res['concatAllFiles']['allFiles'])
          }else{
            hashValues = res['concatAllFiles']['allFiles']
          }
        }, (err) => {
        })

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
          //console.log('clicked');
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
      // imageDrop: true,
      // imageResize: {
      //   displaySize: true,
      //   handleStyles: {
      //     backgroundColor: 'black',
      //     border: 'none',
      //     color: 'white',
      //     zIndex: '10000'
      //   },
      //   toolbarStyles: {
      //     backgroundColor: 'black',
      //     border: 'none',
      //     color: 'white',
      //     zIndex: '10000'
      //   },
      //   displayStyles:{
      //     zIndex: '10000'
      //   }
      // },
      mention: {
        allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
        mentionDenotationChars: ["@", "#"],
        defaultMenuOrientation: 'top',
        source: (searchTerm, renderList, mentionChar) => {
          if (mentionChar === "@") {
            this.mentionValues = Value;
          } else if(mentionChar === "#" && searchTerm.length === 0) {

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
            this.groupService.getAllSharedGroupFiles(this.group_id,this.user_data.workspace._id,this.user_data.user_id)
            .subscribe((res) => {
              hashValues = this.postService.removeDuplicates([ ...hashValues, ...res['concatAllFiles']['allFiles'] ], 'id')
            }, (err) => {
              console.log('Error occured while fetching the group document files', err);
            })
            this.mentionValues = hashValues;
          }
          if (searchTerm.length === 0) {
            renderList(this.mentionValues, searchTerm);
          } else {
            const matches = [];
            for (var i = 0; i < this.mentionValues.length; i++)
              if (~this.mentionValues[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())) matches.push(this.mentionValues[i]);
            renderList(matches, searchTerm);
          }
        }
      },
    };
    this.modulesLoaded = true;
  }
}
