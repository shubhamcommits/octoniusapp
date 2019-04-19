import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { PostService } from '../../../../../shared/services/post.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-collaborative-doc-group-navbar',
  templateUrl: './collaborative-doc-group-navbar.component.html',
  styleUrls: ['./collaborative-doc-group-navbar.component.scss']
})
export class CollaborativeDocGroupNavbarComponent implements OnInit {

  document_name = 'Untitled';

  editing_title = false;

  postId: any;

  @Input() documentContent: any;

  @Output() clickBack: EventEmitter<any> = new EventEmitter();

  constructor(private postService: PostService,
    private activatedRoute: ActivatedRoute) {
      this.postId = this.activatedRoute.snapshot.paramMap.get('postId');
     }

  ngOnInit() {
    this.getPost();
  }

  clickOnBack(){
    this.clickBack.emit('Click on back');
  }

  getPost(){
    this.postService.getPost(this.postId)
    .subscribe((res)=>{
      console.log('Fetched post', res);
      this.document_name = res['post']['title'];
    }, (err)=>{
      console.log('Error while fetching the post', err);
    })
  }

  saveTitle(event: any){
    if(event.keyCode == 13){
      const post = {
        'title': this.document_name
      };
      console.log(post);
      this.postService.editPost(this.postId, post)
      .subscribe((res)=>{
        console.log('Title saved', res);
        this.document_name = res['post']['title'];
      }, (err)=>{
        console.log('Error while saving the title', err);
      })
    }

    if (event.which == '13') {
      event.preventDefault();
    }


    this.editing_title = false;

  }

}
