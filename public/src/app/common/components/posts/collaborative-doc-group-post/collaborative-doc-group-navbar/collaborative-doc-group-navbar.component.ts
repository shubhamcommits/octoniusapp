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
  document_content = '';

  editing_title = false;

  postId: any;

  @Input() post: any;

  @Output() clickBack: EventEmitter<any> = new EventEmitter();

  @Output() docTitle: EventEmitter<any> = new EventEmitter();

  constructor(private postService: PostService,
    private activatedRoute: ActivatedRoute) {
      this.postId = this.activatedRoute.snapshot.paramMap.get('postId');
     }

  ngOnInit() {
    this.getPost();
    setTimeout(() => {
      console.log('Post', this.post);

    }, 5000);
    
  }

  clickOnBack(){
    this.clickBack.emit('Click on back');
  }

  getPost(){
    this.postService.getPost(this.postId)
    .subscribe((res)=>{
      console.log('Fetched post', res);
      this.document_name = res['post']['title'];
      this.document_content = res['post']['content'];
    }, (err)=>{
      console.log('Error while fetching the post', err);
    })
  }

  saveTitle(event: any){
      const post = {
        'title': this.document_name,
        'content': this.post.content,
        'type': 'document'
      };
      console.log(post);
      this.postService.editPost(this.postId, post)
      .subscribe((res)=>{
        console.log('Title saved', res);
        this.docTitle.emit(post['title']);
        this.document_name = res['post']['title'];
      }, (err)=>{
        console.log('Error while saving the title', err);
      })

    this.editing_title = false;

  }

}
