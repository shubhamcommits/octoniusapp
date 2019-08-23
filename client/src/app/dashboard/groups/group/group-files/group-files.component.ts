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
import Swal from 'sweetalert2';
import { DomSanitizer } from '@angular/platform-browser';

declare var $;

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
  selectedDocuments = new Array()
  pdfSourcLink = ""
  iFrameLinks

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
    private snotifyService: SnotifyService,
    public sanitizer: DomSanitizer) { }

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
  }

  ngAfterViewInit(): void {
    $('#holder').lightGallery({
      share:false,
      counter:false,
      selector:".imagePreview",
    });
 }

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

  onDeleteGroupFiles(allGroupFileInfo, postedFiles,fileSource){
    //allGroupFileInfo will store all of the info and will be manipulated to determin what to delete 
    //file source for post/group/agora files to delete
    //agora will be file source will be from ID
    //other sources will be from file arry sent back
    switch (fileSource) {
      case 'group_file':
          Swal.fire({
            title: "Are you sure?",
            text: `You want to remove ${postedFiles.orignal_name} file from the group?`,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, please!'
          })
          .then(willDelete => {
            if (willDelete.value) {
              //console.log("beforeSplice", allGroupFileInfo)
              //have file ready for delete
                this.groupService.deleteGroupFile(this.group_id,fileSource,postedFiles,allGroupFileInfo)
                .subscribe((res) => {
                  //remove file from the list 
                  const indexedFile = allGroupFileInfo.files.map(function(item) {
                      return item._id
                    }).indexOf(postedFiles._id);
                    allGroupFileInfo.files.splice(indexedFile, 1);

                  if (allGroupFileInfo.files.length == 0){
                    //remove item from list if it is empty
                    const indexedGroupFile = this.allFiles.map(function(item) {
                      return item._id
                    }).indexOf(allGroupFileInfo._id);
                    this.allFiles.splice(indexedGroupFile, 1);
                    Swal.fire("Removed!", postedFiles.orignal_name + " has been removed!", "success");
                  }else{
                    Swal.fire("Removed!", postedFiles.orignal_name + " has been removed!", "success");
                  }
                  
                },(err)=>{
                  Swal.fire("Error!", postedFiles.orignal_name + " has been not removed!", "error");
                });
            }
          });
        break;
      case 'agora_file':
          Swal.fire({
            title: "Are you sure?",
            text: `You want to remove ${allGroupFileInfo._name} file from the group?`,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, please!'
          })
          .then(willDelete => {
            if (willDelete.value) {
                this.groupService.deleteGroupFile(this.group_id,fileSource,"empty",allGroupFileInfo)
                .subscribe((res) => {
                    //remove item from list if it is empty
                    const indexedGroupFile = this.allFiles.map(function(item) {
                      return item._id
                    }).indexOf(allGroupFileInfo._id);
                    this.allFiles.splice(indexedGroupFile, 1);
                    Swal.fire("Removed!", postedFiles._name + " has been removed!", "success");
                },(err)=>{
                  Swal.fire("Error!", postedFiles._name + " has been not removed!", "error");
                });
            }
          });
        break;
      default:
        break;
    }
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
  addFolderEvent(files){
    var formData = new FormData()
      // add the files to the formData
      if (files !== null) {
        for (let i = 0 ; i < files.length ; i++) {
          formData.append('attachments', files[i], files[i]['name']);
        }
      }
    this.groupService.addGroupFileInFileSection(this.group_id,this.user_id,formData)
    .subscribe((res) => {
      const allCurrentIndexFiles = res['filesFromFileSectionNewUpload'].files.forEach(innerPostFiles => {
        if (innerPostFiles.orignal_name){
          const mimeTypeFile = innerPostFiles.orignal_name.substring(innerPostFiles.orignal_name.lastIndexOf('.') + 1)
          innerPostFiles["mimeType"] = mimeTypeFile

        }else{
          innerPostFiles["mimeType"] = "noMime"
        }
      });

      if(this.allFiles.length > 0){
        this.allFiles.unshift(res['filesFromFileSectionNewUpload'])
      }else{

        this.allFiles = [res['filesFromFileSectionNewUpload']]
      }

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

      const allCurrentIndexFiles = res['filesFromFileSectionNewUpload'].files.forEach(innerPostFiles => {
        if (innerPostFiles.orignal_name){
          const mimeTypeFile = innerPostFiles.orignal_name.substring(innerPostFiles.orignal_name.lastIndexOf('.') + 1)
          innerPostFiles["mimeType"] = mimeTypeFile

        }else{
          innerPostFiles["mimeType"] = "noMime"
        }
      });

      if(this.allFiles.length > 0){
        this.allFiles.unshift(res['filesFromFileSectionNewUpload'])
      }else{
        this.allFiles = [res['filesFromFileSectionNewUpload']]
      }

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
        if(res['concatAllFiles'].length > 0){
          this.has_file = true
          
          const indexedFile = res['concatAllFiles'].forEach(allFiles => {
            
              if(allFiles.files){
                const allCurrentIndexFiles = allFiles.files.forEach(innerPostFiles => {
                  if (innerPostFiles.orignal_name){
                    const mimeTypeFile = innerPostFiles.orignal_name.substring(innerPostFiles.orignal_name.lastIndexOf('.') + 1)
                    innerPostFiles["mimeType"] = mimeTypeFile

                  }else{
                    innerPostFiles["mimeType"] = "noMime"
                  }
                });
              }
              if(allFiles._name){
             //checks for octo-doc published files but I will just make this default file
              }
          })
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

  pdfPreviewClicked(src:string){
    this.pdfSourcLink = `${this.BASE_URL}/uploads/${src}`
    document.body.style.overflow = "hidden"
  }

  otherMimeTypeclick(src:string){
    // this.iFrameLinks = `${this.BASE_URL}/uploads/${src}`
    document.body.style.overflow = "hidden"
    this.iFrameLinks = this.sanitizer.bypassSecurityTrustResourceUrl("https://view.officeapps.live.com/op/embed.aspx?src=https://workplace.octonius.com/uploads/1566507468492agora%20test.docx");
  }

  onLoad(){
    console.log("loaded")
  }

  overlayRemoval(mimetype:String){
    document.body.style.overflow = ""
    document.getElementById("overlay-iframe").remove()
    this.iFrameLinks = ""

    switch (mimetype) {
     case 'pdf':
        this.pdfSourcLink = ""
       break;

     default:
        event.stopPropagation();
       break;
   }
  }
}
