import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FlamingoService } from 'src/shared/services/flamingo-service/flamingo.service';
import { environment } from 'src/environments/environment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-flamingo-preview',
  templateUrl: './flamingo-preview.component.html',
  styleUrls: ['./flamingo-preview.component.scss']
})
export class FlamingoPreviewComponent implements OnInit {

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
    private _ActivatedRoute: ActivatedRoute,
    private _Injector: Injector,
  ) { }

  async ngOnInit() {
    // Set the fileId variable
    this.fileId = this._ActivatedRoute.snapshot.params['id'];

    // Fetch Files Details
    this.flamingo = await this.getFlamingo(this.fileId);

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
  * This function is responsible to change the question
  */
  nextQuestion() {
    if(this.activeQuestionIndex < this.questions.length-2){
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
    this.utilityService.getConfirmDialogAlert($localize`:@@flamingoPreview.areYouSure:Are you sure?`, $localize`:@@flamingoPreview.flamingoWillBeSubmited:By doing this the flamingo will be submited!`)
      .then((result) => {
        if (result.value) {
          // go to last screen
          this.activeQuestion = this.questions[this.questions.length-1];
        }
      });
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
