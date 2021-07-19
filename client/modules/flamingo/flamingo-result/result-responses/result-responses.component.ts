import { Component, Input, OnChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FlamingoService } from 'src/shared/services/flamingo-service/flamingo.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-result-responses',
  templateUrl: './result-responses.component.html',
  styleUrls: ['./result-responses.component.scss']
})
export class ResultResponsesComponent implements OnChanges {

  @Input() responses: any;

  responseListHeight: string;
  activeResponseIndex = 0;
  activeResponse: any;

  questionId: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private flamingoService: FlamingoService,
    public utilityService: UtilityService
  ) { }

  async ngOnChanges() {
    if (this.responses) {
      this.activeResponse = this.responses[this.activeResponseIndex];
    }
    this.responseListHeight = (window.innerHeight - 90) + 'px';
  }

  /**
  * This function is responsible to change the active index
  * @param event
  * @param index
  */
  async changeActiveIndex(index: number) {
    this.activeResponseIndex = index;
    this.activeResponse = this.responses[this.activeResponseIndex];
    this.questionId = this.activeResponse?._question;
  }

  /**
   * This method is responsile for obtaining the class based on the question type
   * @param questionType
   */
  getQuestionTypeClass(questionType: string) {
    switch (questionType) {
      case 'ShortText':
        return 'sort-text';
      case 'Yes/No':
        return 'yes-no';
      case 'Scale':
        return 'scale';
      case 'Dropdown':
        return 'dropdown';
      case 'Multiple':
        return 'multiselect';
    }
  }

  /**
   * This method is responsile for obtaining the icon based on the question type
   * @param questionType
   */
  getQuestionTypeIcon(questionType: string) {
    switch (questionType) {
      case 'ShortText':
        return 'text_snippet';
      case 'Yes/No':
        return 'rule';
      case 'Scale':
        return 'leaderboard';
      case 'Dropdown':
        return 'done';
      case 'Multiple':
        return 'done';
    }
  }
}
