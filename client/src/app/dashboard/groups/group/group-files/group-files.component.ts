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
import { DocumentFileService } from '../../../../shared/services/document-file.service';
import { SnotifyService, SnotifyPosition, SnotifyToastConfig } from 'ng-snotify';

@Component({
  selector: 'app-group-files',
  templateUrl: './group-files.component.html',
  styleUrls: ['./group-files.component.scss']
})
export class GroupFilesComponent implements OnInit {

  user_id;
  group_id;
  groupImageUrl = '';
  posts = new Array();
  documentFiles = new Array();
  allFiles = new Array();

  has_file = false;

  group = {
    description: ''
  };

  BASE_URL = environment.BASE_URL;

  isLoading$ = new BehaviorSubject(false);

  constructor(private ngxService: NgxUiLoaderService, private postService: PostService,
    public groupDataService: GroupDataService, private groupService: GroupService,
    private _userService: UserService,
    private documentFileService: DocumentFileService,
    private snotifyService: SnotifyService) { }

  async ngOnInit() {
    this.ngxService.start(); // start foreground loading with 'default' id
    this.user_id = JSON.parse(localStorage.getItem('user'))['user_id']
    this.group_id = this.groupDataService.groupId;
    // this.loadDocumentFiles();
    this.loadGroupUploadedFiles()
    .then(()=>{
      this.ngxService.stop();
    })
    .catch((err)=>{
      console.log('Unexpected error', err);
    });
    // this.loadFiles()
    // .then(()=>{
    //   this.ngxService.stop();
    // })
    // .catch((err)=>{
    //   console.log('Unexpected error', err);
    // })
    // this.loadGroupPosts();
  }

  // loadFiles() {
  //   return new Promise((resolve, reject)=>{
  //     this.isLoading$.next(true);

  //     this.groupService.getGroupFiles(this.group_id)
  //       .subscribe((res) => {
  //         console.log('Group posts:', res);
  //         this.posts = res['posts'];
  //         for(let i = 0; i < this.posts.length; i++){
  //           if(this.posts[i].files.length > 0){
  //             this.has_file = true;
  //             break;

  //           }
  //         }
  //       // console.log('Group posts:', this.posts);
  //      //  console.log('Has File:', this.has_file);
  //        this.isLoading$.next(false);
  //        resolve();

  //       }, (err) => {
  //         console.log('Error while loading files', err);
  //         reject(err);

  //       });

  //   })

  // }

  // loadGroupPosts() {

  //   this.isLoading$.next(true);

  //   this.postService.getGroupPosts(this.group_id)
  //     .subscribe((res) => {
  //       // console.log('Group posts:', res);
  //       this.posts = res['posts'];
  //       for(var i = 0; i < this.posts.length; i++){
  //         if(this.posts[i].files.length > 0){
  //           this.has_file=true;
  //           break;

  //         }
  //         else{
  //           this.has_file=false;
  //         }
  //       }
  //   //   console.log('Group posts:', this.posts);
  //     // console.log('Has File:', this.has_file);
  //      this.isLoading$.next(false);


  //     }, (err) => {

  //     });

  // }

  onDownlaodFile(fileName, fileName_orignal) {

    const fileData = {
      'fileName': fileName
    };
    this.groupService.downloadGroupFile(this.group_id, fileName)
      .subscribe((file) => {

    //    console.log('Downloaded File', file);
        saveAs(file, fileName_orignal);

      }, (err) => {
     //   console.log('Downloaded File err', err);

      });
  }

  onDeleteFile(fileName, fileName_orignal){
    const fileData = {
      'fileName': fileName
    };
    this.groupService.deleteFile(this.group_id, fileName)
      .subscribe(() => {
        console.log('success');
      });
  }

  loadGroup() {
    this.groupService.getGroup(this.group_id)
      .subscribe((res) => {
    //    console.log('Group: ', res);
        if (res['group']['group_avatar'] == null) {
      //    console.log('Inside if: ', this.groupImageUrl);

          this.groupImageUrl = '/assets/images/group.png';
        } else {
          this.groupImageUrl = environment.BASE_URL + `/uploads/${res['group']['group_avatar']}`;

        }

        this.group.description = res['group']['description'];

      }, (err) => {

     //   console.log('err: ', err);

      });

  }

  // loadDocumentFiles(){
  //   return new Promise((resolve, reject)=>{
  //     this.documentFileService.getFiles(this.group_id)
  //     .subscribe((res)=>{
  //       console.log('All document files', res);
  //       if(res['file'].length > 0){
  //         this.documentFiles = res['file'];
  //         this.has_file = true;
  //       }
  //       resolve();
  //     }, (err)=>{
  //       console.log('Error occured while fetching the group document files', err);
  //       reject(err);
  //     })
  //   })
  // }

  addFileEvent(fileInput:any){
    var formData = new FormData()
    const files:Array<File> = <Array<File>>fileInput.target.files;
      // add the files to the formData
      if (files !== null) {
        for (let i = 0 ; i < files.length ; i++) {
          formData.append('attachments', files[i], files[i]['name']);
        }
      }
    this.groupService.addGroupFileInFileSection(this.group_id,this.user_id,formData)
    .subscribe((res) => {

      this.allFiles.unshift(res['filesFromFileSectionNewUpload'])
      this.snotifyService.success(`Files Uploaded!`, {
        timeout: 1500,
        showProgressBar: false,
      });
    }, (err) => {
      console.log('Error while uploading files', err);
      this.snotifyService.error(`Error while uploading files!`, {
        timeout: 1500,
        showProgressBar: false,
      });
    });
  }

  loadGroupUploadedFiles(){
    return new Promise((resolve, reject)=>{
      this.isLoading$.next(true);
      this.groupService.getGroupFileInFileSection(this.group_id)
      .subscribe((res)=>{
        // console.log(res["concatAllFiles"])
        if(res['concatAllFiles'].length > 0){
          this.has_file = true
          this.allFiles = res['concatAllFiles']
        }else{
          this.has_file = false
        }
        this.isLoading$.next(false)
        resolve();
      }, (err)=>{
        console.log('Error occured while fetching the group document files', err);
        reject(err);
      })
    })
  }

}
