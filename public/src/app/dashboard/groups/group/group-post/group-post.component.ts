import { Component, OnInit } from '@angular/core';
import { PostService } from '../../../../shared/services/post.service';
import { ActivatedRoute } from '@angular/router';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { InputValidators } from '../../../../common/validators/input.validator';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { GroupService } from '../../../../shared/services/group.service';
import { GroupDataService } from '../../../../shared/services/group-data.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-group-post',
  templateUrl: './group-post.component.html',
  styleUrls: ['./group-post.component.scss']
})
export class GroupPostComponent implements OnInit {

  user_data;

  post;
  postId;

  showComments = {
    id: '',
    normal: false,
    event: false,
    task: false
  };
  comment = {
    content: '',
    _commented_by: '',
    post_id: ''
  };
  commentForm;

  group_id;

  BASE_URL = environment.BASE_URL;

  comments = new Array();

  allMembersId = [];

  members = [];

  files = [];

  content_mentions = [];

  modules={};

  constructor(private ngxService: NgxUiLoaderService, private postService: PostService,
    private groupService: GroupService, private _activatedRoute: ActivatedRoute, public groupDataService: GroupDataService) {
    this.postId = this._activatedRoute.snapshot.paramMap.get('postId');
    this.user_data = JSON.parse(localStorage.getItem('user'));
    this.group_id = this._activatedRoute.snapshot['_urlSegment']['segments'][2].path;
    this._activatedRoute.params
    .subscribe((res)=>{
     
      //console.log(this._activatedRoute);
      this.ngOnInit();
    });
   

    //this.ngOnInit();
   }

  ngOnInit() {
    this.ngxService.start(); // start foreground loading with 'default' id
 
    // Stop the foreground loading after 5s
    setTimeout(() => {
      this.ngxService.stop(); // stop foreground loading with 'default' id
    }, 500);
    this.getPost(this.postId);
    this.mentionmembers();
    this.inilizeCommentForm();

   // console.log('Post ID', this.postId);
   // console.log('Group ID', this.group_id);
  }

  getPost(postId){
    this.postService.getPost(postId)
        .subscribe((res) => {
          this.post = res['post'];
        //  console.log('Post', this.post);

        }, (err)=>{
          swal("Error!", "Error received while fetching the post " + err, "danger");
        });

  }

  inilizeCommentForm() {
    this.commentForm = new FormGroup({
      'commentContent': new FormControl(null, [Validators.required, InputValidators.fieldCannotBeEmpty]),
    });
  }

  onAddNewComment(post_id) {
    this.comment.post_id = post_id;
    this.comment._commented_by = this.user_data.user_id;

    this.postService.addNewComment(post_id,this.comment)
      .subscribe((res) => {
        this.commentForm.reset();
        this.getPost(post_id);
      }, (err) => {
        swal("Error!", "Error received while adding the new comment " + err, "danger");
      });
      this.loadComments(post_id);
      this.showComments.id=this.post._id;
      this.showComments.normal=!this.showComments.normal;
      this.comment.content = '';
      this.comment._commented_by = '';
      this.comment.post_id = '';
      
  }

  OnMarkEventCompleted(){

    const button = document.getElementById("button_event_mark_completed");

    const post = {
      'post_id': this.postId,
      'user_id': this.user_data.user_id
    };
    this.postService.complete(this.postId, post)
    .subscribe((res) => {
      this.playAudio();
  //    console.log('Post Marked as Completed');

      button.style.background="#005fd5";
      button.style.color="#ffffff";
      button.innerHTML="Completed";
      button.setAttribute('disabled', 'true');
      this.getPost(this.postId);

    }, (err) => {

      swal("Error!", "Error received while completing the Event post " + err, "danger");

    });

  }

  OnMarkTaskToDo(post_id){
    const post = {
      'status': 'to do'
    };
    this.postService.complete(post_id,post)
    .subscribe((res) => {
      console.log('Post Marked as to do', res);
      this.playAudio();
      this.getPost(this.postId);
      swal("Good Job!", "The status of task has been updated sucessfully!", "success");


    }, (err) => {

      console.log('Error:', err);
      swal("Error!", "Error received while updating the task as to-do " + err, "danger");

    });

  }

  OnMarkTaskInProgress(post_id){
    const post = {
      'status': 'in progress'
    };
    this.postService.complete(post_id,post)
    .subscribe((res) => {
      console.log('Post Marked as in Progress', res);
      this.playAudio();
      this.getPost(this.postId);
      swal("Good Job!", "The status of task has been updated sucessfully!", "success");
    }, (err) => {

      console.log('Error:', err);
      swal("Error!", "Error received while updating the task as marked in progress " + err, "danger");

    });

  }


    OnMarkTaskCompleted(post_id){
      const post = {
        'status': 'done'
       // 'user_id': this.user_data.user_id
      };
      this.postService.complete(post_id,post)
      .subscribe((res) => {

        this.playAudio();
         console.log('Normal post response: ', res);

        console.log('Post Marked as Completed');
        this.getPost(this.postId);

        swal("Good Job!", "The status of task has been updated sucessfully!", "success");

      }, (err) => {

        console.log('Error:', err);
        swal("Error!", "Error received while completing the task post " + err, "danger");

      });
    }


  
  // !-PLAY THE AUDIO--! //
  playAudio(){
    let audio = new Audio();
    audio.src = "/assets/audio/intuition.ogg";
    audio.load();
    audio.play();
  }
  // !-PLAY THE AUDIO--! //



  // !-LIKE A POST--! //
  likepost(){
    if(this.post._liked_by.length == 0){
      const post = {
        'post_id': this.postId,
        'user_id': this.user_data.user_id
      };
  
      this.postService.like(post)
      .subscribe((res) => {
     //   console.log('Post Liked!');
        this.getPost(this.postId);
      }, (err) => {
        swal("Error!", "Error received while liking the Post " + err, "danger");
      });
    }

    else{
      if(this.post._liked_by.includes(this.user_data.user_id) ==  true){
        this.unlikepost();
      }
      else
      {
        const post = 
        {
          'post_id': this.postId,
          'user_id': this.user_data.user_id
        };
    
        this.postService.like(post)
        .subscribe((res) => {
       //   console.log('Post Liked!');
          this.getPost(this.postId);
        }, (err) => {
          swal("Error!", "Error received while liking the Post " + err, "danger");
        });
      }
    }
  }
  // !-LIKE A POST--! //



  // !-UNLIKE A POST--! //
  unlikepost(){
    const post = {
      'post_id': this.postId,
      'user_id': this.user_data.user_id
    };

    this.postService.unlike(post)
    .subscribe((res) => {
   //   console.log('Post Unliked!');
      this.getPost(this.postId);
    }, (err) => {
      swal("Error!", "Error received while Unliking the Post " + err, "danger");
    });
  }
  // !-UNLIKE A POST--! //



    // !-LOADS ALL COMMENTS IN A POST--! //
    loadComments(postId) {
      var commentData = new Array();
  
      this.postService.getComments(postId)
        .subscribe((res) => {
         // console.log(res['comments']);
          this.comments = res['comments'];
        }, (err) => {
          swal("Error!", "Error while retrieving the comments " + err, "danger");
        });
    }
    // !-LOADS ALL COMMENTS IN A POST--! //
  
  
  
    // !--FETCH DATA OF SINGLE COMMENT--! //
    getSingleComment(commentId){
      this.postService.getComment(commentId)
      .subscribe((res) => {
       // console.log(res);
      }, (err) => {
        swal("Error!", "Error while fetching the comment " + err, "danger");
      });
    }
    // !--FETCH DATA OF SINGLE COMMENT--! //
  
  
  
    // !--HIDE/SHOW THE NORMAL TYPE POST COMMENTS BOX--! //
    normalCommentBoxToggle() {
      const normalCommentBox = document.getElementById('normalComments');

      if(normalCommentBox.style.display == 'block'){
        normalCommentBox.style.display = 'none';
      }
      else {
        normalCommentBox.style.display = 'block';
      }
    }
    // !--HIDE/SHOW THE NORMAL TYPE POST COMMENTS BOX--! //
  
  
  
    // !--HIDE/SHOW THE TASK TYPE POSTS COMMENTS BOX--! //
    taskCommentBoxToggle() {
      const taskCommentBox = document.getElementById('taskComments');
  
      if(taskCommentBox.style.display == 'block'){
        taskCommentBox.style.display = 'none';
      }
      else {
        taskCommentBox.style.display = 'block';
      }
    }
    // !--HIDE/SHOW THE TASK TYPE POSTS COMMENTS BOX--! //
  
  
  
    // !--HIDE/SHOW THE EVENT TYPE POSTS COMMENTS BOX--! //
    eventCommentBoxToggle() {
      const eventCommentBox = document.getElementById('eventComments');

      if(eventCommentBox.style.display == 'block'){
        eventCommentBox.style.display = 'none';
      }
      else {
        eventCommentBox.style.display = 'block';
      }

    }
    // !--HIDE/SHOW THE EVENT TYPE POSTS COMMENTS BOX--! //


    // !--TOGGLE THE EVENT FOR ANY ENTINTY--! //
    toggled(event) {
      if (event) {
       //   console.log('is open');
      } else {
      //  console.log('is closed');
      }
    }
    // !--TOGGLE THE EVENT FOR ANY ENTINTY--! //

    OnEditComment(index){
      const editor = document.getElementById('edit-comment-'+index);
      const button = document.getElementById('button_edit_comment'+index);
      editor.style.display = 'block';
      button.style.display = 'block';
    }
  
    OnSaveEditComment(index, commentId, postId){
      const editor = document.getElementById('edit-comment-'+index);
      const comment ={
        content: document.getElementById('commentContent-'+index).innerHTML,
        contentMentions: this.content_mentions
      };
      
      var scanned_content = comment.content;
      var el = document.createElement('html');
      el.innerHTML = scanned_content;
  
      if (el.getElementsByClassName('mention').length > 0) {
  
        // console.log('Element',  el.getElementsByClassName( 'mention' ));
        for (var i = 0; i < el.getElementsByClassName('mention').length; i++) {
          if (el.getElementsByClassName('mention')[i]['dataset']['value'] == "all") {
            for (var i = 0; i < this.allMembersId.length; i++) {
              this.content_mentions.push(this.allMembersId[i]);
            }
            //this.content_mentions = this.allMembersId;
          }
          else {
            if (!this.content_mentions.includes(el.getElementsByClassName('mention')[i]['dataset']['id']))
              this.content_mentions.push(el.getElementsByClassName('mention')[i]['dataset']['id']);
          }
        }

      }
      //  console.log('Comment:', commentId);
      //  console.log('Post Id', postId);
      this.postService.updateComment(commentId, comment)
      .subscribe((res) => {
        console.log('Comment Updated', res);
        this.loadComments(postId);
        this.content_mentions = [];
      }, (err) =>{
        this.content_mentions = [];
      //  console.log('Error while updating the comment', err);
        swal("Error!", "Error while updating the comment " + err, "danger");
      })
  
    }

    OnDeleteComment(commentId) {
      swal({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        dangerMode: true,
        buttons: ["Cancel", "Yes, delete it!"],
  
      })
        .then(willDelete => {
          if (willDelete) {
            this.postService.deleteComment(commentId)
              .subscribe((res) => {
                console.log('Normal post response: ', res);
                this.getPost(res['commentRemoved']['_post']);
                this.loadComments(res['commentRemoved']['_post']);
              }, (err) => {
  
                if (err.status) {
                  swal("Error!", "Seems like, there's an error found " + err, "danger");
  
                } else {
                  swal("Error!", "Either server is down, or no Internet connection!", "danger");
                }
  
              });
            swal("Deleted!", "The following post has been deleted!", "success");
          }
        });
  
    }
  


    mentionmembers() {
      var hashValues = [];
  
      var Value = [];
  
      this.groupService.getGroup(this.group_id)
        .subscribe((res) => {
          //  console.log('Group', res);
          Value.push({ id: '', value: 'all' });
  
          for (var i = 0; i < res['group']._members.length; i++) {
            this.members.push(res['group']._members[i].first_name + ' ' + res['group']._members[i].last_name);
            this.allMembersId.push(res['group']._members[i]._id);
            Value.push({ id: res['group']._members[i]._id, value: res['group']._members[i].first_name + ' ' + res['group']._members[i].last_name });
          }
          for (var i = 0; i < res['group']._admins.length; i++) {
            this.members.push(res['group']._admins[i].first_name + ' ' + res['group']._admins[i].last_name);
            this.allMembersId.push(res['group']._admins[i]._id);
            Value.push({ id: res['group']._admins[i]._id, value: res['group']._admins[i].first_name + ' ' + res['group']._admins[i].last_name });
          }
         //  console.log('All members ID', this.allMembersId);
  
        }, (err) => {
          
          swal("Error!", "Error received while fetching the members " + err, "danger");
        });
  
      this.groupService.getGroupFiles(this.group_id)
        .subscribe((res) => {
          //  console.log('Group Files:', res['posts']);
          this.files = res['posts'];
          for (var i = 0; i < res['posts'].length; i++) {
            if (res['posts'][i].files.length > 0) {
              hashValues.push({ id: res['posts'][i].files[0]._id, value: '<a style="color:inherit;" target="_blank" href="' + this.BASE_URL + '/uploads/' + res['posts'][i].files[0].modified_name + '"' + '>' + res['posts'][i].files[0].orignal_name + '</a>' })
            }
  
          }
        }, (err) => {
          
         // swal("Error!", "Error received while fetching the group files " + err, "danger");
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
  
          [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  
          [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
          [{ 'font': [] }],
          [{ 'align': [] }],
  
          ['clean'],                                         // remove formatting button
  
          ['link', 'image', 'video']]
      }
  
  
      this.modules = {
        toolbar: toolbaroptions,
        mention: {
          allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
          mentionDenotationChars: ["@", "#"],
          source: function (searchTerm, renderList, mentionChar) {
            let values;
  
            if (mentionChar === "@") {
              values = Value;
            } else {
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
          },
        },
      }
  
    }

}
