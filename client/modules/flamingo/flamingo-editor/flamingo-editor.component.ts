import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FlamingoService } from 'src/shared/services/flamingo-service/flamingo.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { environment } from 'src/environments/environment';
import { PublicFunctions } from 'modules/public.functions';
import { MatDialog } from '@angular/material/dialog';
import { ColorPickerDialogComponent } from 'src/app/common/shared/color-picker-dialog/color-picker-dialog.component';

@Component({
  selector: 'app-flamingo-editor',
  templateUrl: './flamingo-editor.component.html',
  styleUrls: ['./flamingo-editor.component.scss']
})
export class FlamingoEditorComponent implements OnInit {

  questions: any = [];

  flamingo: any;

  fileId: string;

  // GroupID Variable
  groupId: any;

  workspaceId: any;

  activeQuestionIndex = 0;

  questionListHeight: String;

  activeQuestion: any;

  newOption: any;

  updatedOption: any;

  scaleSize = 5;

  showLabels: boolean = false;

  FLAMINGO_UPLOADS = environment.UTILITIES_FLAMINGOS_UPLOADS;

  // Public Functions
  public publicFunctions = new PublicFunctions(this._Injector);

  constructor(
    private router: Router,
    private _ActivatedRoute: ActivatedRoute,
    private _Injector: Injector,
    public dialog: MatDialog
  ) { }

  async ngOnInit() {

    // Set the fileId variable
    this.fileId = this._ActivatedRoute.snapshot.params['id'];

    this.groupId = this._ActivatedRoute.snapshot.queryParamMap.get('group');

    // Fetch the current user
    const userData = await this.publicFunctions.getCurrentUser();

    this.workspaceId = userData?._workspace
    // Fetch Files Details
    this.flamingo = await this.getFile(this.fileId);

    if (this.flamingo) {
      this.questions = this.flamingo._questions;

      if (this.questions) {
        this.activeQuestion = this.questions[this.activeQuestionIndex];
      } else {
        this.questions = [];
      }
    }
    this.questionListHeight = (window.innerHeight - 90) + 'px';

  }

  /**
  * This function is responsible to set the question's text.
  * @param event
  * @param index
  */
  async changeQuestionText(event: any, index: number) {
    this.updateQuestion(this.questions[index]._id, { text: this.questions[index].text })
  }

  /**
  * This function is responsible to set the question's secondary text.
  * @param event
  * @param index
  */
  async changeQuestionSecondaryText(event: any, index: number) {
    this.updateQuestion(this.questions[index]._id, { secondary_text: this.questions[index].secondary_text })
  }

  /**
  * This function is responsible to change the active index
  * @param event
  * @param index
  */
  async changeActiveIndex(index: number) {
    this.activeQuestionIndex = index;
    this.activeQuestion = this.questions[this.activeQuestionIndex];
  }

  /**
  * This function is responsible to change the active index
  * @param event
  * @param index
  * @param index
  */
  async changeYesNoText(event: any, index: any, option: string) {
    if (option === 'yes') {
      this.updateQuestion(this.questions[index]._id, { positive_option_text: this.questions[index].positive_option_text })
    } else if (option === 'no') {
      this.updateQuestion(this.questions[index]._id, { negative_option_text: this.questions[index].negative_option_text })
    }
  }

  /**
  * This function is responsible to set the options of dropdown question.
  * @param event
  * @param index
  */
  async changeOptionText(event: any, i: number, j: number) {
    if (j == null) {
      this.questions[i].options.push(this.newOption);
      this.newOption = '';
      this.updateQuestion(this.questions[i]._id, { options: this.questions[i].options })

    } else if (j != null) {
      this.questions[i].options[j] = event.target.value;
      this.updateQuestion(this.questions[i]._id, { options: this.questions[i].options })

    }
  }

  /**
  * This function is responsible to set the scale of question.
  * @param event
  * @param index
  */
  async setScaleSize(event: any, index: any) {
    this.questions[index].scale.size = event.value;
    this.updateQuestion(this.questions[index]._id, { 'scale.size': event.value })
  }

  /**
  * This function is responsible to enabel disable question scale label
  * @param event
  * @param index
  */
  async enabelDisableLabel(event: any, index: any) {
    if (event.checked) {
      this.questions[index].show_scale_labels = true;
      this.updateQuestion(this.questions[index]._id, { show_scale_labels: true })
    } else {
      this.questions[index].show_scale_labels = false;
      this.updateQuestion(this.questions[index]._id, { show_scale_labels: false })
    }
  }


  /**
  * This function is responsible to make the question mandatory or not
  * @param event
  * @param index
  */
  async makeMandatory(event: any, index: any) {
    if (event.checked) {
      this.questions[index].mandatory = true;
      this.updateQuestion(this.questions[index]._id, { mandatory: true })
    } else {
      this.questions[index].mandatory = false;
      this.updateQuestion(this.questions[index]._id, { mandatory: false })
    }
  }
  /**
  * This function is responsible to set question scale label
  * @param event
  * @param index
  * @param type
  */
  async setLable(event: any, index: any, type: any) {
    if (type === 'left') {
      this.questions[index].scale.left_side_label = event.target.value;
      this.activeQuestion.scale.left_side_label = event.target.value;
      this.updateQuestion(this.questions[index]._id, { 'scale.left_side_label': event.target.value })
    } else if (type === 'centre') {
      this.questions[index].scale.center_label = event.target.value;
      this.activeQuestion.scale.center_label = event.target.value;
      this.updateQuestion(this.questions[index]._id, { 'scale.center_label': event.target.value })
    } else if (type === 'right') {
      this.questions[index].scale.right_side_label = event.target.value;
      this.activeQuestion.scale.right_side_label = event.target.value;
      this.updateQuestion(this.questions[index]._id, { 'scale.right_side_label': event.target.value })
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

    let data: any;
    if (type == 'Scale') {
      data = { type: type, scale: { size: 11, left_side_label: '', center_label: '', right_side_label: '' } }
    } else {
      data = { type: type }
    }

    // Call the HTTP Request Asynschronously
    utilityService.asyncNotification(
      $localize`:@@flamingoEditor.pleaseWaitCreatingQuestion:Please wait while we are creating a new question`,
      new Promise((resolve, reject) => {
        flamingoService.createQuestion(this.flamingo._id, data)
          .then((res) => {

            this.flamingo = res['flamingo'];
            this.questions = this.flamingo._questions;

            resolve(utilityService.resolveAsyncPromise($localize`:@@flamingoEditor.questionCreated:Question has been created and added to Flamingo`))

          })
          .catch(() => {
            reject(utilityService.rejectAsyncPromise($localize`:@@flamingoEditor.unexpectedErrorCreatingQuestion:Unexpected error occurred while creating the Question, please try again!`))
          })
      }))
  }

  /**
  * This function opens up the task content in a new modal, and takes #content in the ng-template inside HTML layout
  * @param content
  */
  async openDetails(content: any) {

    // Utility Service
    let utilityService = this._Injector.get(UtilityService)

    // Open Modal
    utilityService.openModal(content, {
      size: 'md',
      centered: true
    });

  }

  /**
   * This function opens up the dialog to select a color
   */
  openColorPicker(index: any, type: string) {
    const dialogRef = this.dialog.open(ColorPickerDialogComponent, {
      width: '67%',
      height: '50%',
      disableClose: false,
      hasBackdrop: true,
      data: { colorSelected: (type == 'background') ? this.activeQuestion?.background_color : this.activeQuestion?.text_color }
    });

    const colorPickedSubs = dialogRef.componentInstance.colorPickedEvent.subscribe(async (data) => {
      if (type == 'background') {
        await this.updateQuestion(this.questions[index]._id, { background_color: data });
        this.questions[index].background_color = data;
        this.activeQuestion.background_color = data;
      }

      if (type == 'text') {
        await this.updateQuestion(this.questions[index]._id, { text_color: data });
        this.questions[index].text_color = data;
        this.activeQuestion.text_color = data;
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      colorPickedSubs.unsubscribe();
    });
  }

  /**
  * This function is responsible to handle change on upload image.
  * @param data
  */
  onUploadImageEmitter(data: any) {
    this.activeQuestion = data;
    for (let index = 0; index < this.questions.length; index++) {
      if (this.questions[index]._id === data._id) {
        this.questions[index] = data;
      }

    }
  }

  /**
  * This function is responsible to remove the image from question
  * @param index
  */
  async removeImage(index: any) {
    await this.updateQuestion(this.questions[index]._id, { image_url: '' });
    this.questions[index].image_url = '';
    this.activeQuestion.image_url = '';
  }

  /**
  * This function is responsible to remove the background color from question
  * @param index
  */
  async removeBackgroundColor(index: any) {
    await this.updateQuestion(this.questions[index]._id, { background_color: '' });
    this.questions[index].background_color = '';
    this.activeQuestion.background_color = '';
  }

  /**
  * This function is responsible to remove the background color from question
  * @param index
  */
  async removeTextColor(index: any) {
    await this.updateQuestion(this.questions[index]._id, { text_color: '' });
    this.questions[index].text_color = '';
    this.activeQuestion.text_color = '';
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
      $localize`:@@flamingoEditor.pleaseWaitDeletingQuestion:Please wait while we are deleting question`,
      new Promise((resolve, reject) => {
        flamingoService.deleteQuestion(this.flamingo?._id, questionId)
          .then((res) => {

            this.flamingo = res['flamingo'];

            this.questions = this.flamingo._questions;
            if (this.activeQuestionIndex > 0) {
              this.activeQuestionIndex = this.activeQuestionIndex - 1;
            } else if (this.activeQuestionIndex < this.questions.length - 1) {
              this.activeQuestionIndex = this.activeQuestionIndex + 1;
            } else {
              this.activeQuestionIndex = 0;
            }

            this.activeQuestion = this.questions[this.activeQuestionIndex];

            resolve(utilityService.resolveAsyncPromise($localize`:@@flamingoEditor.questionDeleted:Question has been deleted and removed from Flamingo!`))

          })
          .catch(() => {
            reject(utilityService.rejectAsyncPromise($localize`:@@flamingoEditor.unexpectedErrorDeletingQuestion:Unexpected error occurred while deleting Question, please try again!`))
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
      $localize`:@@flamingoEditor.pleaseWaitUpdatingQuestion:Please wait while we are updating question`,
      new Promise((resolve, reject) => {
        flamingoService.updateQuestion(questionId, questionData)
          .then((res) => {

            resolve(utilityService.resolveAsyncPromise($localize`:@@flamingoEditor.questionUpdated:Question has been updated!`))

          })
          .catch(() => {
            reject(utilityService.rejectAsyncPromise($localize`:@@flamingoEditor.unexpectedErrorUpdatingQuestion:Unexpected error occurred while updating Question, please try again!`))
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
