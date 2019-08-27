import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs';
import { Cacheable, CacheBuster } from 'ngx-cacheable';
import { DOMStorageStrategy } from 'ngx-cacheable/common/DOMStorageStrategy';

const cacheBuster$ = new Subject<void>();

@Injectable()
export class PostService {

  BASE_API_URL = environment.BASE_API_URL;

  // handling date modal actions
  openDatePicker = new Subject();
  datePicked = new Subject();

  // handling time modal actions
  openTimePicker = new Subject();
  timePicked = new Subject();

  // handling assign-users modal actions
  openAssignUsers = new Subject();
  usersAssigned = new Subject();

  constructor(private _http: HttpClient) { }

  // METHODS TO HANDLE HTTP REQUESTS

  @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  })
  getGroupPosts(group_id) {
    return this._http.get(this.BASE_API_URL + '/groups/' + group_id + '/posts');
  }

  @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  })
  getGroup(group_id) {
    return this._http.get(this.BASE_API_URL + '/group/' + group_id);
  }

  @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  })
  getNextPosts(group_id, last_post_id) {
    return this._http.get(this.BASE_API_URL + '/groups/' + group_id + '/nextPosts/' + last_post_id);
  }

  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
  addNewNormalPost(post) {
    return this._http.post(this.BASE_API_URL + '/posts', post);
  }

  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
  addNewEventPost(post) {
    return this._http.post(this.BASE_API_URL + '/posts', post);
  }

  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
  addNewTaskPost(post) {
    this.manuallyBustCache();
    return this._http.post(this.BASE_API_URL + '/posts', post);
  }

  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
  addNewCollabPost(post) {
    return this._http.post(this.BASE_API_URL + '/posts', post);
  }

  editPost(postId, post) {
    // this.manuallyBustCache();
    return this._http.put<any>(this.BASE_API_URL + `/posts/${postId}`, post);
  }

  deletePost(postId) {
    this.manuallyBustCache();
    return this._http.delete(this.BASE_API_URL + `/posts/${postId}`);
  }

  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
  markPostAsRead(postId) {
    return this._http.put(`${this.BASE_API_URL}/posts/read/${postId}`, null);
  }

  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
  markCommentAsRead(commentId: any): Observable<any> {
    return this._http.put(`${this.BASE_API_URL}/posts/comments/read/${commentId}`, null);
  }

  complete(postId, status) {
    this.manuallyBustCache();
    return this._http.put(this.BASE_API_URL + `/posts/${postId}/taskStatus`, status);
  }

  @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  })
  getCalendarPosts(data) {
    return this._http.get(this.BASE_API_URL + `/groups/${data.groupId}/calendar/${data.year}/${data.month}`);
  }

  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
  like(post) {
    return this._http.put(this.BASE_API_URL + `/posts/${post._id}/like`, post);
  }

  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
  follow(post) {
    return this._http.put(this.BASE_API_URL + `/posts/${post._id}/follow`, post);
  }

  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
  unfollow(post) {
    return this._http.put(this.BASE_API_URL + `/posts/${post._id}/unfollow`, post);
  }

  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
  numFollowers(post) {
    return this._http.get(this.BASE_API_URL + `/posts/${post._id}/followers`);
  }

  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
  likeComment(comment) {
    return this._http.put(this.BASE_API_URL + `/posts/comments/${comment._id}/like`, comment);
  }

  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
  unlike(post) {
    return this._http.put(this.BASE_API_URL + `/posts/${post._id}/unlike`, post);
  }

  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
  unlikeComment(comment) {
    return this._http.put(this.BASE_API_URL + `/posts/comments/${comment._id}/unlike`, comment);
  }

  @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  })
  useroverviewposts(user_id) {
    return this._http.get(this.BASE_API_URL + '/users/overview/');
  }

  /***
   * Jessie Jia Edit Starts
   * @param postId
   */
  @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  })
  userOverviewPostsToday(user_id) {
    return this._http.get(this.BASE_API_URL + '/users/overviewToday');
  }

  @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  })
  userOverviewPostsWeek(user_id) {
    return this._http.get(this.BASE_API_URL + '/users/overviewWeek/');
  }

  /***
   * Jessie Jia Edit Ends
   * @param postId
   */
  @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  })
  getPost(postId) {
    return this._http.get(this.BASE_API_URL + '/posts/' + postId);
  }

  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
  addNewComment(postId, comment) {
    return this._http.post(this.BASE_API_URL + `/posts/${postId}/comments`, comment);
  }

  @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  })
  getComment(commentId) {
    return this._http.get(this.BASE_API_URL + `/posts/comments/${commentId}`);
  }

  @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  })
  getComments(postId) {
    return this._http.get(this.BASE_API_URL + `/posts/${postId}/comments`);
  }

  @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  })
  getNextComments(postId, commentId) {
    return this._http.get(this.BASE_API_URL + `/posts/${postId}/nextComments/${commentId}`);
  }

  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
  updateComment(commentId, comment) {
    return this._http.put(this.BASE_API_URL + `/posts/comments/${commentId}`, comment);
  }

  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
  deleteComment(commentId) {
    return this._http.delete(this.BASE_API_URL + `/posts/comments/${commentId}`);
  }

  @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  })
  getDocument(postId) {
    return this._http.get(this.BASE_API_URL + `/posts/documents/${postId}`);
  }

  /*removeDuplicates(originalArray: Array<Object>, objKey: any) {
    var trimmedArray = [];
    var values = [];
    var value;

    for(var i = 0; i < originalArray.length; i++) {
      value = originalArray[i][objKey];

      if(values.indexOf(value) === -1) {
        trimmedArray.push(originalArray[i]);
        values.push(value);
      }
    }
    return trimmedArray;

  }*/

  removeDuplicates(myArr, prop) {
    return myArr.filter((obj, pos, arr) => {
        return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
    });
}

  // SHARED FUNCTIONS ACROSS COMPONENTS

  playAudio() {
    const audio = new Audio();
    audio.src = '/assets/audio/intuition.ogg';
    audio.load();
    audio.play();
  }

  uploadQuillFiles(file: File) {
    const fd = new FormData();
    fd.append('attachments', file);
    return this._http.post(this.BASE_API_URL + '/posts/upload', fd);
  }

  onSaveEditPost() {
  //  add this function later
  }

  /**
   * Manually busting a part of the cache whose service methods
   * are in another service.ts file.
   *
   * This method particularly handles the updating of pulse data
   * in the cache for group activity.
   */
  manuallyBustCache(): void {
    const cache = JSON.parse(localStorage.getItem('CACHE_STORAGE'));
    if (environment.production) {
      cache['n#getPulseNumDoneTasks'] = undefined;
      cache['n#getPulseNumInProgressTasks'] = undefined;
      cache['n#getPulseNumTodoTasks'] = undefined;
      cache['n#getPulseTotalNumTasks'] = undefined;
      cache['n#getGroupTasks'] = undefined;
      cache['n#getCompletedGroupTasks'] = undefined;
      cache['n#getCompletedUserTasks'] = undefined;
      cache['n#getUserTasks'] = undefined;
      cache['n#userOverviewPostsToday'] = undefined;
      cache['n#userOverviewPostsWeek'] = undefined;
      cache['n#useroverviewposts'] = undefined;
      cache['n#getGroupPosts'] = undefined;
    } else {
      cache['GroupService#getPulseNumDoneTasks'] = undefined;
      cache['GroupService#getPulseNumInProgressTasks'] = undefined;
      cache['GroupService#getPulseNumTodoTasks'] = undefined;
      cache['GroupService#getPulseTotalNumTasks'] = undefined;
      cache['GroupService#getGroupTasks'] = undefined;
      cache['GroupService#getCompletedGroupTasks'] = undefined;
      cache['UserService#getCompletedUserTasks'] = undefined;
      cache['UserService#getUserTasks'] = undefined;
      cache['PostService#userOverviewPostsToday'] = undefined;
      cache['PostService#userOverviewPostsWeek'] = undefined;
      cache['PostService#useroverviewposts'] = undefined;
      cache['PostService#getGroupPosts'] = undefined;
    }

    localStorage.setItem('CACHE_STORAGE', JSON.stringify(cache));
  }
}
