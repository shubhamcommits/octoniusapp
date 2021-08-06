import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FlamingoService } from 'src/shared/services/flamingo-service/flamingo.service';
import { environment } from 'src/environments/environment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

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
  disableNext = false;

  progressValue = 0;

  FLAMINGO_UPLOADS = environment.UTILITIES_FLAMINGOS_UPLOADS;

  constructor(
    private utilityService: UtilityService,
    private flamingoService: FlamingoService,
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
      this.utilityService.errorNotification($localize`:@@flamingoAnswer.flamingoIsNotPublishedYet:The Flamingo you are trying to access is not published yet, please try again later!`)
      this.router.navigate(['/',]);
    }

    this.questions = this.flamingo._questions;

    // Add a last question as a thank you screen after submitting the flamingo
    this.questions.push({
      type: 'LastScreen'
    });

    this.activeQuestion = this.questions[this.activeQuestionIndex];

    this.disableNext = this.checkMandatoryQuestion();
    this.calculateProgressValues();

  }

  /**
   * This function is responsible for saving the answer
   */
  answerQuestion(value) {

    if (this.activeQuestion.type == 'Multiple') {
      this.activeQuestion.answer_multiple = value;
    } else {
      this.activeQuestion.answer = value;
    }

    this.disableNext = this.checkMandatoryQuestion();

    // Go to Next Question
    if (((!this.activeQuestion?.mandatory)
          || (!(this.activeQuestion?.type != 'Scale' && !this.activeQuestion?.answer))
          || (this.activeQuestion?.type == 'Scale' && this.activeQuestion?.answer >= 0))
        && (this.activeQuestion?.type != 'Multiple')) {
      this.nextQuestion();
    }
  }

  /**
   * This function is responsible to change to the next question
   */
  nextQuestion() {
    if (this.activeQuestionIndex < this.questions.length-2) {
      this.activeQuestionIndex = this.activeQuestionIndex+1;
      this.activeQuestion = this.questions[this.activeQuestionIndex];

      this.disableNext = this.checkMandatoryQuestion();
      this.calculateProgressValues();
    }
  }

  /**
  * This function is responsible to change to the previous question
  */
  previousQuestion() {
    this.activeQuestionIndex = this.activeQuestionIndex-1;
    this.activeQuestion = this.questions[this.activeQuestionIndex];
    this.calculateProgressValues();
  }

  /**
   * This functin is responsible for submitting the answer
   */
  submitAnswers() {
    this.utilityService.getConfirmDialogAlert($localize`:@@flamingoAnswer.areYouSure:Are you sure?`, $localize`:@@flamingoAnswer.flamingoWillBeSubmited:By doing this the flamingo will be submited!`)
      .then((result) => {
        if (result.value) {
          this.callSubmitAnswersService();
        }
      });
  }

  callSubmitAnswersService() {
    let responses = [];
    for (let i = 0; i < this.questions.length; i++) {
      const question = this.questions[i];
      switch (question.type) {
        case 'ShortText':
          responses.push({
            _question: question._id,
            text_answer: question.answer
          });
          break;

        case 'Yes/No':
          if (question.answer == 'positive') {
            responses.push({
              _question: question._id,
              positive_answer: true,
              negative_answer: false
            });
          } else if (question.answer == 'negative') {
            responses.push({
              _question: question._id,
              positive_answer: false,
              negative_answer: true
            });
          }
          break;

        case 'Scale':
          responses.push({
            _question: question._id,
            scale_answer: question.answer
          });
          break;

        case 'Dropdown':
          responses.push({
            _question: question._id,
            dropdown_answer: question.answer
          });
          break;

        case 'Multiple':
          responses.push({
            _question: question._id,
            answer_multiple: question.answer_multiple
          });
          break;
      }
    }

    // Call the HTTP Request Asynschronously
    this.utilityService.asyncNotification(
      $localize`:@@flamingoAnswer.pleaseWaitWhileSubmittingFlamingo:Please wait while we are submitting the flamingo`,
      new Promise((resolve, reject) => {
        this.flamingoService.submit(this.flamingo._id, responses)
          .then((res) => {
            // go to last screen
            this.activeQuestion = this.questions[this.questions.length-1];
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@flamingoAnswer.flamingoSubmited:Flamingo has been submited!`));
          })
          .catch(() => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@flamingoAnswer.unexpectedErrorOccuredSubmittingFlamingo:Unexpected error occured while submitting Flamingo, please try again!`));
          });
    }));
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

    checkMandatoryQuestion() {
      if (this.activeQuestion?.mandatory) {
        if (this.activeQuestion?.type == 'Scale') {
          if (this.activeQuestion?.answer >= 0) {
            return false;
          } else {
            return true;
          }
        } else  if (!this.activeQuestion?.answer) {
          return true;
        }
      }
      return false;
    }

    calculateProgressValues() {
      this.progressValue = ((this.activeQuestionIndex + 1) * 100) / this.questions.length;
    }

    enableNextButton(answer: string) {
      this.disableNext = (answer.length == 0) && this.checkMandatoryQuestion();
    }
}
