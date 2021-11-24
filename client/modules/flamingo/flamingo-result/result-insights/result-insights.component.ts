import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FlamingoService } from 'src/shared/services/flamingo-service/flamingo.service';
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
    public utilityService: UtilityService,
    private flamingoService: FlamingoService
  ) { }

  async ngOnChanges() {
    // Remove the questions which will not be shown in the insights page
    this.questions = await this.questions?.filter((question) => {
      return question.type != 'Welcome' && question.type != 'Thanks' && question.type != 'ShortText';
    });

    this.questions?.forEach(question => {
      const responses = this.getScaleResponses(question._id);
      this.scaleResponses.set(question._id, responses);
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
    return this.flamingoService.getPositiveResponsesStats(this.responses, questionId);
  }

  /**
   * This methods calculates the number of negative answers for a specific Yes/No question
   * @param questionId
   * @returns
   */
   getNegativeResponsesStats(questionId: string) {
    return this.flamingoService.getNegativeResponsesStats(this.responses, questionId);
  }

  /**
   * This methods calculates the number of answers for a specific option in a Dropdown question
   * @param questionId
   * @param selectedOption
   * @returns
   */
  getDropdawnResponsesStats(questionId: string, selectedOption: string) {
    return this.flamingoService.getDropdawnResponsesStats(this.responses, questionId, selectedOption);
  }

  getScaleResponses(questionId: string) {
    return this.flamingoService.getScaleResponses(this.responses, questionId);
  }

  getMultipleResponsesStats(questionId: string, selectedOption: string) {
    return this.flamingoService.getMultipleResponsesStats(this.responses, questionId, selectedOption);
  }
}
