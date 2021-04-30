import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-result-insights',
  templateUrl: './result-insights.component.html',
  styleUrls: ['./result-insights.component.scss']
})
export class ResultInsightsComponent implements OnChanges, OnInit  {

  @Input() responses: any;
  @Input() questions: any = [];

  scaleResponses = new Map();

  constructor(
    public utilityService: UtilityService
  ) { }

  async ngOnChanges() {
    // Remove the questions which will not be shown in the insights page
    this.questions = await this.questions?.filter((question) => {
      return question.type != 'Welcome' && question.type != 'Thanks' && question.type != 'ShortText';
    });

    this.questions?.forEach(question => {
      const resonses = this.getScaleResponses(question._id);
      this.scaleResponses.set(question._id, resonses);
    });
  }

  async ngOnInit() {

  }

  /**
   * This methods calculates the number of positive answers for a specific Yes/No question
   * @param questionId
   * @returns
   */
  getPositiveResponsesStats(questionId: string) {
    let responsesMatch = []
    this.responses?.forEach(response => {

      const answerIndex = response?.answers?.findIndex(answer => answer._question._id == questionId);
      const answer = response?.answers[answerIndex];

      if (answer?._question?.type == 'Yes/No' && answer?.positive_answer) {
        responsesMatch.push({
          positive_answer: answer.positive_answer
        });
      }
    });
    return responsesMatch?.length;
  }

  /**
   * This methods calculates the number of negative answers for a specific Yes/No question
   * @param questionId
   * @returns
   */
   getNegativeResponsesStats(questionId: string) {
    let responsesMatch = []
    this.responses?.forEach(response => {

      const answerIndex = response?.answers?.findIndex(answer => answer?._question?._id == questionId);
      const answer = response?.answers[answerIndex];

      if (answer?._question.type == 'Yes/No' && answer?.negative_answer) {
        responsesMatch.push({
          negative_answer: answer?.negative_answer
        });
      }
    });
    return responsesMatch?.length;
  }

  /**
   * This methods calculates the number of answers for a specific option in a Dropdown question
   * @param questionId
   * @param selectedOption
   * @returns
   */
  getDropdawnResponsesStats(questionId: string, selectedOption: string) {
    let responsesMatch = []
    this.responses?.forEach(response => {

      const answerIndex = response?.answers?.findIndex(answer => answer._question._id == questionId);
      const answer = response?.answers[answerIndex];

      if (answer._question.type == 'Dropdown' && answer.dropdown_answer == selectedOption) {
        responsesMatch.push({
          dropdown_answer: answer.dropdown_answer
        });
      }
    });
    return responsesMatch?.length;
  }

  getScaleResponses(questionId: string) {
    let responsesMatch = []
    this.responses?.forEach(response => {

      const answerIndex = response?.answers?.findIndex(answer => answer?._question?._id == questionId);
      const answer = response?.answers[answerIndex];
      responsesMatch.push({
        scale_answer: answer?.scale_answer
      });
    });
    return responsesMatch;
  }
}
