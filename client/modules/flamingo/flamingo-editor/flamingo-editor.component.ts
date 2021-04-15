import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FlamingoService } from 'src/shared/services/flamingo-service/flamingo.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-flamingo-editor',
  templateUrl: './flamingo-editor.component.html',
  styleUrls: ['./flamingo-editor.component.scss']
})
export class FlamingoEditorComponent implements OnInit {

  questions: any = [];

  flamingo: any;
  
  fileId: string;
  
  activeQuestionIndex = 0;

  questionListHeight:String;

  activeQuestion: any;

  newOption: any;

  updatedOption: any;
  
  scaleSize = 5;

  showLabels: boolean = false;

  constructor(
    private router: Router,
    private _ActivatedRoute: ActivatedRoute,
    private _Injector: Injector,
  ) { }

  async ngOnInit() {

    // Set the fileId variable
    this.fileId = this._ActivatedRoute.snapshot.params['id'];

    // Fetch Files Details
    this.flamingo = await this.getFile(this.fileId);

    this.questions = this.flamingo.questions;

    this.activeQuestion = this.questions[this.activeQuestionIndex];

    this.questionListHeight =  (window.innerHeight - 90) + 'px';
}


changeQuestionText(event:any, index:number){
  this.updateQuestion(this.questions[index]._id,{text: this.questions[index].text})
}

changeActiveIndex(index:number){
  this.activeQuestionIndex = index;
  this.activeQuestion = this.questions[this.activeQuestionIndex];

}

changeOptionText(event:any,i:number,j:number){
  if(j == null){
      this.questions[i].options.push(this.newOption);
      this.newOption='';
      this.updateQuestion(this.questions[i]._id,{options: this.questions[i].options})

  }else if(j!= null){
    this.questions[i].options[j] = event.target.value;
    this.updateQuestion(this.questions[i]._id,{options: this.questions[i].options})

  }
}

/**
* This function is responsible to set the scale of question.
* @param event
* @param index
*/
async setScaleSize(event:any,index:any){
  this.questions[index].scale.size = event.value;
  this.updateQuestion(this.questions[index]._id, {'scale.size': event.value})
}
/**
* This function is responsible to enabel disable question scale label
* @param event
* @param index
*/
async enabelDisableLabel(event:any,index:any){
  if(event.checked){
    this.questions[index].show_scale_labels = true;
    this.updateQuestion(this.questions[index]._id, { show_scale_labels : true} )
  } else {
    this.questions[index].show_scale_labels = false;
    this.updateQuestion(this.questions[index]._id, { show_scale_labels : false} )
  }
}

/**
* This function is responsible to set question scale label
* @param event
* @param index
* @param type
*/
async setLable(event : any, index : any, type : any){
    if(type === 'left'){
      this.questions[index].scale.left_side_label = event.target.value;
      this.activeQuestion.scale.left_side_label = event.target.value;
      this.updateQuestion(this.questions[index]._id, { 'scale.left_side_label' : event.target.value})
    } else if (type === 'centre'){
      this.questions[index].scale.center_label = event.target.value;
      this.activeQuestion.scale.center_label = event.target.value;
      this.updateQuestion(this.questions[index]._id, { 'scale.center_label': event.target.value})
    } else if (type === 'right'){
      this.questions[index].scale.right_side_label = event.target.value;
      this.activeQuestion.scale.right_side_label = event.target.value;
      this.updateQuestion(this.questions[index]._id, { 'scale.right_side_label' : event.target.value})
    }
}

/**
* This function is responsible to create a question and add it to flamingo
* @param type
*/
async createQuestion(type: any) {
  
  // Flamingo Service
  let flamingoService = this._Injector.get(FlamingoService);

  // Utility Service Instance
  let utilityService = this._Injector.get(UtilityService)
  
  let data:any;
  if( type == 'Scale'){
    data = {type: type , scale: { size: 11, left_side_label:'',center_label:'',right_side_label:''}}
  } else {
    data = {type: type}
  }

  // Call the HTTP Request Asynschronously
  utilityService.asyncNotification(
    `Please wait while we are creating a new question`,
    new Promise((resolve, reject) => {
      flamingoService.createQuestion(this.flamingo._id, data)
        .then((res) => {

          this.flamingo = res['flamingo'];

          this.questions = this.flamingo.questions;

          resolve(utilityService.resolveAsyncPromise('Question has been created and added to Flamingo'))

        })
        .catch(() => {
          reject(utilityService.rejectAsyncPromise('Unexpected error occured while uploading, please try again!'))
        })
    }))
}




/**
* This function is responsible to create a question and add it to flamingo
* @param type
*/
async deleteQuestion(questionId: any) {
  
  // Flamingo Service
  let flamingoService = this._Injector.get(FlamingoService);

  // Utility Service Instance
  let utilityService = this._Injector.get(UtilityService)

  // Call the HTTP Request Asynschronously
  utilityService.asyncNotification(
    `Please wait while we are deleting question`,
    new Promise((resolve, reject) => {
      flamingoService.deleteQuestion(this.flamingo._id, questionId)
        .then((res) => {

          this.flamingo = res['flamingo'];
          
          this.questions = this.flamingo.questions;
          if(this.activeQuestionIndex > 0){
            this.activeQuestionIndex = this.activeQuestionIndex - 1;
          } else if(this.activeQuestionIndex < this.questions.length-1){
            this.activeQuestionIndex = this.activeQuestionIndex + 1;
          } else {
            this.activeQuestionIndex = 0;
          }

          this.activeQuestion = this.questions[this.activeQuestionIndex];

          resolve(utilityService.resolveAsyncPromise('Question has been deleted and removed from Flamingo!'))

        })
        .catch(() => {
          reject(utilityService.rejectAsyncPromise('Unexpected error occured while uploading, please try again!'))
        })
    }))
}

/**
* This function is responsible to create a question and add it to flamingo
* @param type
*/
async updateQuestion(questionId: any, questionData: any) {
  
  // Flamingo Service
  let flamingoService = this._Injector.get(FlamingoService);

  // Utility Service Instance
  let utilityService = this._Injector.get(UtilityService)

  // Call the HTTP Request Asynschronously
  utilityService.asyncNotification(
    `Please wait while we are updating question`,
    new Promise((resolve, reject) => {
      flamingoService.updateQuestion(questionId, questionData)
        .then((res) => {

          resolve(utilityService.resolveAsyncPromise('Question has been updated!'))

        })
        .catch(() => {
          reject(utilityService.rejectAsyncPromise('Unexpected error occured while uploading, please try again!'))
        })
    }))
}

/**
* This function is responsible for fetching a flamingo's details
* @param fileId
*/
public async getFile(fileId: any) {
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
