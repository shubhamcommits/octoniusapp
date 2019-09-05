import { Component, EventEmitter, Input, OnInit, Output, ViewChild, Renderer, ElementRef, OnDestroy} from '@angular/core';
import { PostService } from "../../../../shared/services/post.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { saveAs } from 'file-saver';
import { GroupService } from "../../../../shared/services/group.service";
import { CommentSectionComponent } from "../../comments/comment-section/comment-section.component";
import moment from 'moment';
import { GroupActivityComponent } from '../../../../dashboard/groups/group/group-activity/group-activity.component';
import { SnotifyService } from "ng-snotify";
import { SearchService } from '../../../../shared/services/search.service';
import { environment } from '../../../../../environments/environment';
import { ColumnService } from '../../../../shared/services/column.service';
import { Column } from '../../../../shared/models/column.model';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'task-group-post',
  templateUrl: './task-group-post.component.html',
  styleUrls: ['./task-group-post.component.scss']
})
export class TaskGroupPostComponent implements OnInit , OnDestroy{
  @ViewChild(CommentSectionComponent, { static: true }) commentSectionComponent;
  @ViewChild('taskStatusList', { static: true }) taskStatusList;
  @Input() groupactivity: GroupActivityComponent;

  @Input() post;
  @Input() preview; // true if the post is in preview mode, else false
  @Input('group') group;
  @Input('user') user;
  @Input('user_data') user_data;
  @Input('allMembersId') allMembersId;
  @Input('socket') socket;
  @Input('modules') modules;
  @Input('isItMyWorkplace') isItMyWorkplace;

  @Output('deletePost') removePost = new EventEmitter();

  @Output() statusChanged: EventEmitter<any> = new EventEmitter();
  BASE_URL = environment.BASE_URL;

  // alerts & messages
  staticAlertClosed = false;
  alert = {
    class: '',
    message: ''
  };
  _message = new Subject<string>();

  // whether we display certain sections of template
  commentsDisplayed = false;
  displayCommentEditor = false;
  displayEditPostSection = false;

  // the total amount of comments that this post has
  commentCount = 0;

  // collection of loaded comments
  comments = [];

  // edit post
  edit_title = '';
  edit_content = '';
  selectedGroupUsers = [];
  assignment = 'Unassigned';
  model_date;

  // editor
  editor;

  profilePic: any;

  //file previews
  listenFuncForImageClicks: Function;
  pdfSourceLinks = ""
  iFrameSourceLinks
  imageSourceLinks = []

  // mentions
  content_mentions = [];

  ngUnsubscribe = new Subject();

  tags: any = [];
  tags_search_words: String = ''
  tags_search_result: any = new Array();

  // collapsibility
  // If true, "read more" text should be displayed and the post should be in preview mode
  // If false, "read less" text should be displayed and the post should be displayed entirely
  readMore: boolean;

  allColumns;

  bgColor = [
    '#fd7714',
    '#0bc6a0',
    '#4a90e2',
    '#d46a6a',
    '#b45a81',
    '#674f91',
    '#4e638e',
    '#489074',
    '#4b956f',
    '#a7c763',
    '#d4cb6a',
    '#d49b6a',
    '#d4746a'
  ];


  constructor(
    private postService: PostService,
    private groupService: GroupService,
    private snotifyService: SnotifyService,
    private searchService: SearchService,
    private columnService: ColumnService,
    private renderer: Renderer,
    private elementRef: ElementRef,
    public sanitizer: DomSanitizer,) {
      this.listenFuncForImageClicks = this.renderer.listen(this.elementRef.nativeElement, 'click', (event) => {

        if(event.target.className === "imagePreview" && event.target.tagName == "IMG"){
            this.imageSourceLinks = [...this.imageSourceLinks, event.target.src] 
       
            document.body.style.overflow = "hidden"
        }
    });

    }

  ngOnInit() {
    this.commentCount = this.post.comments.length;

    // saving the app from getting crashed because it might be undefined
    if (this.post['tags'] != undefined) {
      this.tags = this.post.tags;
    }
    else {
      this.tags = [];
    }

    if (this.user['profile_pic'] == null) {
      this.profilePic = 'assets/images/user.png';
    } else {
      // console.log('Inside else');
      this.profilePic = `${environment.BASE_URL}/uploads/${this.user['profile_pic']}`;
     }

    if(this.post['files'].length > 0){

    const allCurrentIndexFiles = this.post['files'].forEach(innerPostFiles => {
      if (innerPostFiles.orignal_name){
        const mimeTypeFile = innerPostFiles.orignal_name.substring(innerPostFiles.orignal_name.lastIndexOf('.') + 1)
        innerPostFiles["mimeType"] = mimeTypeFile

      }else{
        innerPostFiles["mimeType"] = "noMime"
      }
    });
    }
    this.readMore = this.preview;
    this.initColumns();
    this.getAllColumns();

  }
  ngOnDestroy() {
    this.listenFuncForImageClicks();
  }
 applyZoom(htmlDOM): string{
  var parser = new DOMParser();
  var doc = parser.parseFromString(htmlDOM, "text/html");
  // image could be multiple so for each here to be used
  var imgTag:any = doc.getElementsByTagName('img');

  for(var _i=0; _i<imgTag.length; _i++){
    let img:any = doc.getElementsByTagName('img')[_i];
    img.classList.add("imagePreview")
    let clonedImg:any=img.cloneNode(true);
    let acnhorThumbnail=document.createElement('a');
    acnhorThumbnail.href="javascript:void(0)";
    let imgGallery = document.createElement("div");
    acnhorThumbnail.appendChild(clonedImg);
    imgGallery.appendChild(acnhorThumbnail);
    img.replaceWith(imgGallery);
  }
return doc.body.innerHTML;
}

  // Get the duration in days between task start date and complete date using moment.
  getTaskTimeSpent() {
    const start = moment(this.post.task.started_at);
    const end = moment(this.post.task.completed_at);
    const duration = moment.duration(end.diff(start)).asDays();
    return duration <= 1 ? 1 : Math.round(duration)
  }

  deletePost() {
    this.removePost.emit(this.post._id);
  }

  editPost() {
    // set the values for the modal so that they display the current values of the post
    const dateObj = moment(this.post.task.due_to, 'YYYY-MM-DD');
    this.model_date = { year: dateObj.year(), month: dateObj.month(), day: dateObj.date() };
    this.selectedGroupUsers = [this.post.task._assigned_to];
    this.assignment = 'Assigned';

    // set the initial value of the editor
    this.edit_content = this.post.content;
    this.edit_title = this.post.title;

    // show the edit section
    this.displayEditPostSection = true;
  }

  onDownloadFile(fileName) {
    this.groupService.downloadGroupFile(this.group._id, fileName)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((file_toDownload) => {
        saveAs(file_toDownload, fileName);
      }, (err) => { });
  }

  onEditorCreated(quill) {
    this.editor = quill;
  }

  // this function can become a shared one on a service;
  OnSaveEditPost() {

    // we create a new date object based on whether we added time
    const date_due_to = new Date(this.model_date.year, this.model_date.month - 1, this.model_date.day);
    var post;
    //over here its Unassigned and the way the array is sent back we need an object id
    if(this.assignment == "Unassigned" && this.selectedGroupUsers.length == 0){
      post = {
        'title': this.edit_title,
        'content': this.edit_content,
        '_content_mentions': this.content_mentions,
        'type': this.post.type,
        'assigned_to': this.user_data.user_id,
        'date_due_to': moment(date_due_to).format('YYYY-MM-DD'),
        'status': this.post.task.status,
        'tags': this.tags , 
        'unassigned' : 'Yes' 
      };
    }

    if(this.assignment == 'Assigned'){
      post = {
      'title': this.edit_title,
      'content': this.edit_content,
      '_content_mentions': this.content_mentions,
      'type': this.post.type,
      'assigned_to': this.selectedGroupUsers,
      'date_due_to': moment(date_due_to).format('YYYY-MM-DD'),
      'status': this.post.task.status,
      'tags': this.tags ,
      'unassigned' : 'No'
      };
    }
    // handle mentions
    const scanned_content = post.content;
    var el = document.createElement('html');
    el.innerHTML = scanned_content;

    if (el.getElementsByClassName('mention').length > 0) {

      // console.log('Element',  el.getElementsByClassName( 'mention' ));
      for (var i = 0; i < el.getElementsByClassName('mention').length; i++) {
        if (el.getElementsByClassName('mention')[i]['dataset']['value'] === "all") {
          this.content_mentions = [...this.content_mentions, ...this.allMembersId];
        } else {
          if (!this.content_mentions.includes(el.getElementsByClassName('mention')[i]['dataset']['id']))
            this.content_mentions.push(el.getElementsByClassName('mention')[i]['dataset']['id']);
        }
      }

      for (var i = 0; i < this.content_mentions.length; i++) {
        post._content_mentions = this.content_mentions;
      }
    }

    if (this.tags.length > 0) {
      for (let i = 0; i < this.tags.length; i++) {
        post.tags = this.tags;
      }
    }
    // SERVER REQUEST
    this.postService.editPost(this.post._id, post)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res) => {
        this.alert.class = 'success';
        this._message.next(res['message']);

        // we don't want to display the editor after editing
        this.displayEditPostSection = false;
        this.resetEditPostForm();

        // mirror the backend data to keep the user up-to-date
        this.post = res.post;

        // socket notifications
        const data = {
          // it should get automatically, something like workspace: this.workspace_name
          workspace: this.user_data.workspace.workspace_name,
          // it should get automatically, something like group: this.group_name
          group: this.group.group_name,
          userId: this.user_data.user_id,
          postId: res['post']._id,
          groupId: this.group._id,
          type: 'post'
        };

        this.socket.emit('newPost', data);
        this.socket.emit('postEdited', data);
        this.content_mentions = [];
        this.tags = this.post.tags;
      }, (err) => {

        this.alert.class = 'danger';
        this.content_mentions = [];
        this.tags = this.post.tags;

        if (err.status) {
          this._message.next(err.error.message);
        } else {
          this._message.next('Error! either server is down or no internet connection');
        }

      });
  }

  openAssignPicker() {
    // open the assign users modal
    this.postService.openAssignUsers.next(
      {
        options: { centered: true },
        selectedGroupUsers: this.selectedGroupUsers,
        group: this.group,
        // these are the setting for picking a user, later we might want to add this in
        // the modal component itself and link it to post.type
        settings: {
          text: 'Select Group Members',
          classes: 'myclass custom-class',
          singleSelection: true,
          primaryKey: '_id',
          labelKey: 'full_name',
          noDataLabel: 'Search Members...',
          enableSearchFilter: true,
          searchBy: ['full_name', 'capital']
        }
      });

    // when the user completed adding users then we receive the result here
    this.postService.usersAssigned.subscribe((data: any) => {
      this.selectedGroupUsers = data.selectedGroupUsers || [];
      this.assignment = data.assignment || 'Unassigned';
    });
  }

  openDatePicker() {
    // trigger the datepicker modal to open
    this.postService.openDatePicker.next(
      {
        options: { centered: true },
        isItMyWorkplace: this.isItMyWorkplace,
        model_date: this.model_date
      });

    // when the date is picked in the modal we receive the result here.
    this.postService.datePicked
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(model_date => this.model_date = model_date);
  }

  playAudio() {
    this.postService.playAudio();
  }

  resetEditPostForm() {
    this.model_date = null;
    this.edit_content = '';
    this.content_mentions = [];
    this.selectedGroupUsers = [];
  }

  setComments(comments) {
    this.comments = comments;
  }

  setDate(pickedDate) {
    this.model_date = pickedDate;
  }

  toggleComments() {
    this.commentsDisplayed = !this.commentsDisplayed;

    if (!this.commentsDisplayed) {
      this.comments = [];
    }
  }

  togglePostCommentEditor() {
    this.commentSectionComponent.displayCommentEditor = !this.commentSectionComponent.displayCommentEditor;
  }

  toggleTaskStatusList() {
    // we hide or display the possible task statuses
    this.taskStatusList.nativeElement.style.display =
      this.taskStatusList.nativeElement.style.display === 'block' ? 'none' : 'block';
  }

  usersSelected(users) {
    this.selectedGroupUsers = users;
    //this.assignment = users.length < 1 ? "Unassigned" : "Assigned";
  }
  userAssignment(assignment){
    this.assignment = assignment
  }

  addTags(event: any) {
    //keyCode= 13 represents enter key
    // in else case we are making use of mouse click
    if(event.keyCode == 13){
      const tag = document.getElementById('tags');
      this.tags.push(tag['value']);
      this.post.tags = this.tags;
      tag['value'] = '';
      console.log(this.tags);
    }

    if (event.which == '13') {
      event.preventDefault();
    }
  }

  removeTag(index) {
    this.tags.splice(index, 1);
    this.post.tags = this.tags;
  }

  tagListSearch(){
    //console.log("here1")
    if (this.tags_search_words !== '') {
      //console.log("here12")
      this.searchService.getTagsSearchResults(this.tags_search_words)
      .subscribe((res) => {

         if (res) {
          this.tags_search_result = res['results'];
        }
      }, (err)=>{
        console.log('Error while searching', err);
      });
    }else{
      //console.log("here13")
    }
  }
  clickedOnTag(index){
    var tagsFromList = this.tags_search_result[index]["tags"]
    this.tags.push(tagsFromList);;
    this.tags_search_words = '';
    console.log(this.tags);
  }

  toggled(event) {
    if (event) {
        console.log('is open');
    } else {
      console.log('is closed');
    }
  }

  initColumns(){
    this.columnService.initColumns(this.group._id).subscribe(() => {
      this.getAllColumns();
    });   
  }

  getAllColumns(){
    this.columnService.getAllColumns(this.group._id).subscribe((res: Column) => {
      this.allColumns = res.columns;
    }); 
  }

  updateTaskColumn(post_id, oldColumnName, newColumnName){
    console.log(post_id);
    console.log(oldColumnName);
    const statusUpdate = {
      'status' : newColumnName
    }
    console.log(newColumnName);
    this.postService.complete(post_id,statusUpdate)
    .subscribe((res) => {
      this.playAudio();

      this.alert.class = 'success';
      this._message.next(res['message']);

      // change its status on the frontend to match up with the backend
      this.post.task.status = newColumnName;

      this.snotifyService.success('Task updated!', 'Good Job!');
      this.groupService.taskStatusChanged.next();
      this.columnService.addColumnTask(this.group._id, newColumnName).subscribe((res) => {
        console.log(res);
      });
      this.columnService.deleteColumnTask(this.group._id, oldColumnName).subscribe((res) => {
        console.log(res);
      });
      this.getAllColumns();

    }, (err) => {
      console.log('Error:', err);
    });

  }


  imagePreviewClicked(src:string){
    this.imageSourceLinks = [...this.imageSourceLinks, `${this.BASE_URL}/uploads/${src}`] 
    document.body.style.overflow = "hidden"
  }

  pdfPreviewClicked(src:string){
    this.pdfSourceLinks = `${this.BASE_URL}/uploads/${src}`
    document.body.style.overflow = "hidden"
  }
  
//this checks for .ppt, .pptx, .doc, .docx, .xls and .xlsx
  officeMimeTypeclick(src:string){
    this.iFrameSourceLinks = `${this.BASE_URL}/uploads/${src}`
    document.body.style.overflow = "hidden"
    this.iFrameSourceLinks = this.sanitizer.bypassSecurityTrustResourceUrl(`https://view.officeapps.live.com/op/embed.aspx?src=${this.iFrameSourceLinks}`);

  }

  googleMimeTypeclick(src:string){
    this.iFrameSourceLinks = `${this.BASE_URL}/uploads/${src}`
    document.body.style.overflow = "hidden"
    this.iFrameSourceLinks = this.sanitizer.bypassSecurityTrustResourceUrl(`https://docs.google.com/viewer?url=${this.iFrameSourceLinks}&embedded=true`);
  }

  overlayRemoval(mimetype:String){
    document.body.style.overflow = ""

    switch (mimetype) {
      case 'pdf':
        this.pdfSourceLinks = ""
        break;
      case 'images': 
      this.imageSourceLinks = []
        break;
      case 'otherFilesForiFrame':
         document.getElementById("overlay-iframe").remove()
         this.iFrameSourceLinks = ""  
        break;

     default:
        event.stopPropagation();
       break;
   }
  }

}
