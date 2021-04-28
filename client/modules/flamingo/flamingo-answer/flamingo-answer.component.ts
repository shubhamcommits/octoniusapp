import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FlamingoService } from 'src/shared/services/flamingo-service/flamingo.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-flamingo-answer',
  templateUrl: './flamingo-answer.component.html',
  styleUrls: ['./flamingo-answer.component.scss']
})
export class FlamingoAnswerComponent implements OnInit {

  questions: any = [];

  flamingo: any;

  fileId: string;

  activeQuestionIndex = 0;

  activeQuestion: any;

  again: boolean = false;

  FLAMINGO_UPLOADS = environment.FLAMINGO_BASE_URL+'/uploads/'

  constructor(
    private _ActivatedRoute: ActivatedRoute,
    private _Injector: Injector,
    private router: Router
  ) { }

  async ngOnInit() {
    // Set the fileId variable
    this.fileId = this._ActivatedRoute.snapshot.params['id'];

    // Fetch Files Details
    this.flamingo = await this.getFlamingo(this.fileId);

    // if the flamingo is not publish, we send the user to the home page.
    // -- Should do this on the guard, but I am not able to obtain the flamingo ID
    if (!this.flamingo.publish) {
      this.router.navigate(['/',]);
    }

    this.questions = this.flamingo.questions;

    this.activeQuestion = this.questions[this.activeQuestionIndex];

  }

  /**
  * This function is responsible to change the question
  */
  nextQuestion(){
    if(this.activeQuestionIndex < this.questions.length-1){
      this.activeQuestionIndex = this.activeQuestionIndex+1;
      this.activeQuestion = this.questions[this.activeQuestionIndex];
    } else if(this.activeQuestionIndex == this.questions.length-1){
      this.again = true;
    }
  }

  /**
  * This function is responsible to start answer again
  */
  againAnswer(){
      this.again = false;
      this.activeQuestionIndex = 0;
      this.activeQuestion = this.questions[this.activeQuestionIndex];
  }

  /**
  * This function is responsible for fetching a flamingo's details
  * @param fileId
  */
  public async getFlamingo(fileId: any) {
    return new Promise((resolve) => {

      // Flamingo Service
      let flamingoService = this._Injector.get(FlamingoService);

      // Fetch the Flamingo details
      flamingoService.getOne(fileId)
        .then((res) => {
          resolve(res['flamingo'])
        })
        .catch(() => {
          resolve({})
        })
      })
    }

}
