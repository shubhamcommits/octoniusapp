import { Component, OnInit, Input, Injector, EventEmitter, Output } from '@angular/core';
import { PostService } from 'src/shared/services/post-service/post.service';

@Component({
  selector: 'app-like-post',
  templateUrl: './like-post.component.html',
  styleUrls: ['./like-post.component.scss']
})
export class LikePostComponent implements OnInit {

  constructor(
    private _Injector: Injector
  ) { }

  // Post Data
  @Input('post') post: any;

  // User Data Variable
  @Input('userData') userData: any;

  @Output() postLiked = new EventEmitter();
  @Output() postUnLiked = new EventEmitter();

  ngOnInit() {
  }

  /**
   * Like the Post
   */
  likePost(){

    // Add the userId to the post._liked_by array
    this.post._liked_by.push(this.userData._id)

    // Increment the likes count by 1
    this.post.likes_count += 1

    this.postLiked.emit(this.userData._id);

    // Call the Service Function to like a post
    this.onLikePost(this.post._id);
  }

  /**
   * This function is responsible for calling the HTTP request to like a post
   * @param postId
   */
  onLikePost(postId: string){

    // Post Service Instance
    let postService = this._Injector.get(PostService)

    // Return a new promise to call the service function
    return new Promise((resolve, reject)=>{
      postService.like(postId)
      .then((res)=>{
        resolve(res);
      })
      .catch((err)=>{
        reject()
      })
    })
  }

  /**
   * Unlike the post
   */
  unlikePost(){

    // Find the index of where the userId is located
    let userIndex = this.post._liked_by.findIndex((userId: any) => userId === this.userData._id)

    // Remove the userId from the array
    this.post._liked_by.splice(userIndex, 1)

    // Decrement the likes count by 1
    this.post.likes_count -= 1

    this.postUnLiked.emit(this.userData);

    // Call the Service Function to unlike a post
    this.onUnlikePost(this.post._id);
  }

  /**
   * This function is responsible for calling the HTTP request to unlike a post
   * @param postId
   */
  onUnlikePost(postId: string){

    // Post Service Instance
    let postService = this._Injector.get(PostService)

    // Return a new promise to call the service function
    return new Promise((resolve, reject)=>{
      postService.unlike(postId)
      .then((res)=>{
        resolve(res);
      })
      .catch((err)=>{
        reject()
      })
    })
  }

  /**
   * Check if the post is liked by the currently loggedIn user
   */
  isLikedByUser() {
    if (this.post.hasOwnProperty('_liked_by')) {
      if (this.post._liked_by.includes(this.userData?._id))
        return true;
      else
        return false
    }

  }
}
