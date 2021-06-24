import { Component, OnInit, Input, Injector } from '@angular/core';
import { PostService } from 'src/shared/services/post-service/post.service';

@Component({
  selector: 'app-idea-actions',
  templateUrl: './idea-actions.component.html',
  styleUrls: ['./idea-actions.component.scss']
})
export class IdeaActionsComponent implements OnInit {

  constructor(
    private _Injector: Injector
  ) { }

  // Post Data
  @Input('post') post: any;

  // User Data Variable
  @Input('userData') userData: any;

  voteValue = 0;

  ngOnInit() {
    if (!this.post.task.idea) {
      this.post.task.idea = {
        positive_votes: 0,
        negative_votes: 0
      }
    }
  }

  /**
   * Vote
   */
  vote(positiveVote: boolean) {

    // Increment votes
    if (positiveVote) {
      this.voteValue = 1;
      this.post.task.idea.positive_votes += this.voteValue;
    } else {
      this.voteValue = -1;
      this.post.task.idea.negative_votes += this.voteValue;
    }

    // Call the Service Function to vote to a idea
    this.onVote(this.post._id);
  }

  /**
   * This function is responsible for calling the HTTP request to vote an idea
   * @param postId
   */
   onVote(postId: string){

    // Post Service Instance
    let postService = this._Injector.get(PostService)

    // Return a new promise to call the service function
    return new Promise((resolve, reject)=>{
      postService.voteIdea(postId, this.voteValue)
      .then((res) => {
        resolve(res);
      })
      .catch((err)=>{
        reject()
      })
    })
  }
}
