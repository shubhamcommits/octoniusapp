import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FlamingoService {

  constructor(private _http: HttpClient) { }

  baseURL = environment.FLAMINGO_BASE_API_URL;

  /**
   * This function is responsible for fetching list of files
   * @param groupId
   * @param lastFormId
   */
  get(groupId: string, lastFormId: string) {

    if (lastFormId) {
      return this._http.get(this.baseURL + `/`, {
        params: {
          groupId: groupId,
          lastFileId: lastFormId
        }
      }).toPromise();
    } else {
      return this._http.get(this.baseURL + `/`, {
        params: {
          groupId: groupId,
        }
      }).toPromise();
    }
  }

  /**
   * This function is responsible for fetching the flamingo details on the basis of the fileId
   * @param fileId
   */
   getOne(fileId: string) {
    if(fileId) {
      return this._http.get(this.baseURL + `/?fileId=${fileId}`).toPromise();
    }
  }

  /**
   * This function is responsible to create a flamingo
   * @param questionData
   */
   createFlamingo(flamingoData: any){
    return this._http.post(this.baseURL + `/create-flamingo`,{flamingoData}).toPromise();
  }

  /**
   * This function is responsible to create questiona and add it to flamingo
   * @param questionData
   */
   createQuestion(flamingoId: string, questionData:any){
    if (flamingoId) {
      return this._http.post(this.baseURL + `/create-add-question/?flamingoId=${flamingoId}`,{questionData}).toPromise();
    }
  }


  /**
   * This function is responsible to delete question and remove it from flamingo
   * @param flamingoId
   * @param questionId
   */
   deleteQuestion(flamingoId: string,questionId:object){
    if(flamingoId)
      return this._http.delete(this.baseURL + `/question/?flamingoId=${flamingoId}&questionId=${questionId}`).toPromise();
  }

  /**
   * This function is responsible to delete question and remove it from flamingo
   * @param questionData
   * @param questionId
   */
  updateQuestion(questionId:object, questionData: any){
    if(questionId)
      return this._http.put(this.baseURL + `/question/?questionId=${questionId}`,{questionData}).toPromise();
  }

  /**
   * This function is responsible for updating the group avatar
   * @param groupId
   */
  uploadQuestionImage(groupId: any, fileToUpload: File, flamingoId: string,questionId: string, workspaceId : string) {


    // PREPARING FORM DATA
    let formData = new FormData();
    formData.append('questionImage', fileToUpload);



    const fileData = {
      _groupId: groupId,
      flamingoId: flamingoId,
      questionId: questionId,
      workspaceId: workspaceId
    }
    formData.append('fileData', JSON.stringify(fileData));

    return this._http.put(this.baseURL + `/question/image`, formData).toPromise();
  }

  /**
   * This function is responsible to publish/unpublish the flamingo
   * @param flamingoId
   * @param publish
   */
  publish(flamingoId: string, publish: any){
    return this._http.put(this.baseURL + `/publish/?flamingoId=${flamingoId}`, { publish: publish }).toPromise();
  }

  /**
   * This function is responsible to submitting the answers of a user
   * @param flamingoId
   * @param responses
   */
  submit(flamingoId: string, responses: any) {
    return this._http.put(this.baseURL + `/submit/?flamingoId=${flamingoId}`, { responses: responses }).toPromise();
  }

  /**
   * Duplicate flamingo
   *
   * @param fileId
   */
   async copyFlamingo(fileId: string) {
    return this._http.put(this.baseURL + `/${fileId}/copy`, { }).toPromise();
  }

  /**
   * This methods calculates the number of positive answers for a specific Yes/No question
   * @param questionId
   * @returns
   */
  getPositiveResponsesStats(responses: any, questionId: string) {
    let responsesMatch = []
    responses?.forEach(response => {

      const answerIndex = response?.answers?.findIndex(answer => answer?._question?._id == questionId);
      const answer = response?.answers[answerIndex];

      if (answer && answer?._question?.type == 'Yes/No' && answer?.positive_answer) {
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
   getNegativeResponsesStats(responses: any, questionId: string) {
    let responsesMatch = []
    responses?.forEach(response => {

      const answerIndex = response?.answers?.findIndex(answer => answer?._question?._id == questionId);
      const answer = response?.answers[answerIndex];

      if (answer && answer?._question?.type == 'Yes/No' && answer?.negative_answer) {
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
  getDropdawnResponsesStats(responses: any, questionId: string, selectedOption: string) {
    let responsesMatch = []
    responses?.forEach(response => {
      const answerIndex = response?.answers?.findIndex(answer => answer?._question?._id == questionId);
      const answer = response?.answers[answerIndex];

      if (answer && answer?._question?.type == 'Dropdown' && answer?.dropdown_answer == selectedOption) {
        responsesMatch.push({
          dropdown_answer: answer.dropdown_answer
        });
      }
    });
    return responsesMatch?.length;
  }

  getScaleResponses(responses: any, questionId: string) {
    let responsesMatch = []
    responses?.forEach(response => {
      const answerIndex = response?.answers?.findIndex(answer => answer?._question?._id == questionId);
      const answer = response?.answers[answerIndex];
      responsesMatch.push({
        scale_answer: answer?.scale_answer
      });
    });
    return responsesMatch;
  }

  getMultipleResponsesStats(responses: any, questionId: string, selectedOption: string) {
    let responsesMatch = []

    responses?.forEach(response => {
      const answerIndex = response?.answers?.findIndex(answer => answer?._question?._id == questionId);
      const answer = response?.answers[answerIndex];

      if (answer && answer?._question?.type == 'Multiple' && answer?.answer_multiple?.findIndex(answer => answer == selectedOption) >= 0) {
        responsesMatch.push({
          answer_multiple: answer?.answer_multiple
        });
      }
    });
    return responsesMatch?.length;
  }
}
