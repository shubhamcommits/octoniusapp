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
<<<<<<< HEAD
  document_content = '';
=======
>>>>>>> 12b5b94693fe8bb035c1de1c07ab85d2ebaba153

  editing_title = false;

  postId: any;

<<<<<<< HEAD
  @Input() post: any;

  @Output() clickBack: EventEmitter<any> = new EventEmitter();

  @Output() docTitle: EventEmitter<any> = new EventEmitter();

=======
  @Input() documentContent: any;

  @Output() clickBack: EventEmitter<any> = new EventEmitter();

>>>>>>> 12b5b94693fe8bb035c1de1c07ab85d2ebaba153
  constructor(private postService: PostService,
    private activatedRoute: ActivatedRoute) {
      this.postId = this.activatedRoute.snapshot.paramMap.get('postId');
     }

  ngOnInit() {
    this.getPost();
<<<<<<< HEAD
    setTimeout(() => {
      console.log('Post', this.post);

    }, 5000);
    
=======
>>>>>>> 12b5b94693fe8bb035c1de1c07ab85d2ebaba153
  }

  clickOnBack(){
    this.clickBack.emit('Click on back');
  }

  getPost(){
    this.postService.getPost(this.postId)
    .subscribe((res)=>{
      console.log('Fetched post', res);
      this.document_name = res['post']['title'];
<<<<<<< HEAD
      this.document_content = res['post']['content'];
=======
>>>>>>> 12b5b94693fe8bb035c1de1c07ab85d2ebaba153
    }, (err)=>{
      console.log('Error while fetching the post', err);
    })
  }

  saveTitle(event: any){
<<<<<<< HEAD
      const post = {
        'title': this.document_name,
        'content': this.post.content,
        'type': 'document'
=======
    if(event.keyCode == 13){
      const post = {
        'title': this.document_name
>>>>>>> 12b5b94693fe8bb035c1de1c07ab85d2ebaba153
      };
      console.log(post);
      this.postService.editPost(this.postId, post)
      .subscribe((res)=>{
        console.log('Title saved', res);
<<<<<<< HEAD
        this.docTitle.emit(post['title']);
=======
>>>>>>> 12b5b94693fe8bb035c1de1c07ab85d2ebaba153
        this.document_name = res['post']['title'];
      }, (err)=>{
        console.log('Error while saving the title', err);
      })
<<<<<<< HEAD
=======
    }

    if (event.which == '13') {
      event.preventDefault();
    }

>>>>>>> 12b5b94693fe8bb035c1de1c07ab85d2ebaba153

    this.editing_title = false;

  }

}
