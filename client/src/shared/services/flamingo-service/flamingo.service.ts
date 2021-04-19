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
   * This function is responsible for uploding a file to the group
   * @param flamingoData
   */
  createForm(flamingoData: any, ) {
    
    return this._http.post(this.baseURL + `/create-form`, {flamingoData}).toPromise()
  }

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
      }).toPromise()
    } else {
      return this._http.get(this.baseURL + `/`, {
        params: {
          groupId: groupId,
        }
      }).toPromise()
    }
  }

  /**
   * This function is responsible for fetching the flamingo details on the basis of the fileId
   * @param fileId
   */
   getOne(fileId: string){
    if(fileId)
      return this._http.get(this.baseURL + `/?fileId=${fileId}`).toPromise()
  }

  /**
   * This function is responsible to create questiona and add it to flamingo
   * @param questionData
   */
   createQuestion(flamingoId: string, questionData:any){
    if(flamingoId)
      return this._http.post(this.baseURL + `/create-add-question/?flamingoId=${flamingoId}`,{questionData}).toPromise()
  }


  /**
   * This function is responsible to delete question and remove it from flamingo
   * @param flamingoId
   * @param questionId
   */
   deleteQuestion(flamingoId: string,questionId:object){
    if(flamingoId)
      return this._http.delete(this.baseURL + `/question/?flamingoId=${flamingoId}&questionId=${questionId}`).toPromise()
  }

   /**
   * This function is responsible to delete question and remove it from flamingo
   * @param questionData
   * @param questionId
   */
    updateQuestion(questionId:object, questionData: any){
      if(questionId)
        return this._http.put(this.baseURL + `/question/?questionId=${questionId}`,{questionData}).toPromise()
    }

  /**
   * This function is responsible for updating the group avatar
   * @param groupId
   */
  uploadQuestionImage(groupId: any, fileToUpload: File, flamingoId: string,questionId: string,) {

    
    // PREPARING FORM DATA
    let formData = new FormData();
    formData.append('questionImage', fileToUpload);
   
   

    const fileData = {
      _groupId: groupId,
      flamingoId: flamingoId,
      questionId: questionId
    }
    formData.append('fileData', JSON.stringify(fileData));

    console.log("sdsdssdfdsgeewerwf",formData);

    return this._http.put(this.baseURL + `/question/image`, formData).toPromise()
  }

}
