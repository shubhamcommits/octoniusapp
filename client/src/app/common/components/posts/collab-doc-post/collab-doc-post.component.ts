import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, AfterViewInit} from '@angular/core';

import {GroupService} from "../../../../shared/services/group.service";
import { saveAs } from 'file-saver';
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {PostService} from "../../../../shared/services/post.service";
import {FormGroup} from "@angular/forms";
import * as moment from "moment";
import {CommentSectionComponent} from "../../comments/comment-section/comment-section.component";
import {SnotifyService} from "ng-snotify";
import { environment } from '../../../../../environments/environment';
declare var $;

@Component({
  selector: 'app-collab-doc-post',
  templateUrl: './collab-doc-post.component.html',
  styleUrls: ['./collab-doc-post.component.scss']
})
export class CollabDocPostComponent implements OnInit {

  @Input() post: any;
  @Input('group') group;
  @Input('user') user;
  @Input('user_data') user_data;
  @Input('allMembersId') allMembersId;
  @Input('socket') socket;
  @Input('modules') modules;
  @Output('deletePost') removePost = new EventEmitter();
  BASE_URL = environment.BASE_URL;

  ngUnsubscribe = new Subject();

  profilePic: any;

  constructor(    
    private groupService: GroupService,
    private postService: PostService,
    private snotifyService: SnotifyService) { }

  ngOnInit() {
    if (this.user['profile_pic'] == null) {
      this.profilePic = 'assets/images/user.png';
    } else {
      // console.log('Inside else');
      this.profilePic = `${environment.BASE_URL}/uploads/${this.user['profile_pic']}`;
     }
  }

  ngAfterViewInit(): void {
    $('.image-gallery').lightGallery({
      share:false,
      counter:false
    });
 }

  applyZoom(htmlDOM): string{
    var parser = new DOMParser();
    var doc = parser.parseFromString(htmlDOM, "text/html");
    // image could be multiple so for each here to be used
    // var imgCount = doc.getElementsByTagName('img').length;
    var img:any = doc.getElementsByTagName('img')[0];

  if(img){ //if any image exists
      let clonedImg:any=img.cloneNode(true);
      let acnhorThumbnail=document.createElement('a');
      acnhorThumbnail.href=clonedImg.src;
      let imgGallery = document.createElement("div");
      imgGallery.classList.add('image-gallery');
      acnhorThumbnail.appendChild(clonedImg);
      imgGallery.appendChild(acnhorThumbnail);
      img.replaceWith(imgGallery);
      
  } 
  return doc.body.innerHTML;
  }

  deletePost() {
    this.removePost.emit(this.post._id);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
