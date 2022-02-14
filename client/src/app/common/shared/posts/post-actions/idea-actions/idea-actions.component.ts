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

  votedPositiveIndex = -1;
  votedNegativeIndex = -1;

  ngOnInit() {
    if (!this.post.task.idea) {
      this.post.task.idea = {
        positive_votes: [],
        negative_votes: []
      }
    } else if (this.userData) {
      this.votedPositiveIndex = this.post?.task?.idea?.positive_votes?.findIndex(userId => userId == this.userData?._id);
      this.votedNegativeIndex = this.post?.task?.idea?.negative_votes?.findIndex(userId => userId == this.userData?._id);
    }
  }

  /**
   * Vote
   */
  vote(positiveVote: boolean) {

    if ((!positiveVote && this.votedNegativeIndex < 0) || (positiveVote && this.votedPositiveIndex < 0) && this.userData) {
      // Increment votes
      if (positiveVote) {
        this.voteValue = 1;
        if (!this.post.task.idea.positive_votes) {
          this.post.task.idea.positive_votes = [];
        }
        this.post.task.idea.positive_votes.push(this.userData);
      } else {
        this.voteValue = -1;
        if (!this.post.task.idea.negative_votes) {
          this.post.task.idea.negative_votes = [];
        }
        this.post.task.idea.negative_votes.push(this.userData);
      }

      // Call the Service Function to vote to a idea
      this.onVote(this.post._id);
    }
  }

  /**
   * This function is responsible for calling the HTTP request to vote an idea
   * @param postId
   */
   onVote(postId: string){

    // Post Service Instance
    let postService = this._Injector.get(PostService)

    // Return a new promise to call the service function
    return postService.voteIdea(postId, this.voteValue)
      .then((res) => {
        this.post = res['post'];
        this.votedPositiveIndex = this.post.task.idea.positive_votes.findIndex(userId => userId == this.userData._id);
        this.votedNegativeIndex = this.post.task.idea.negative_votes.findIndex(userId => userId == this.userData._id);
      });
  }
}
