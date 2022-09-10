
import { Component, OnInit, Injector } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FilesService } from 'src/shared/services/files-service/files.service';
import { Title } from "@angular/platform-browser";
import { PublicFunctions } from 'modules/public.functions';
import { FlamingoService } from 'src/shared/services/flamingo-service/flamingo.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import moment from 'moment';
import * as XLSX from 'xlsx';
import * as fileSaver from 'file-saver';

@Component({
  selector: 'app-flamingo-header',
  templateUrl: './flamingo-header.component.html',
  styleUrls: ['./flamingo-header.component.scss']
})
export class FlamingoHeaderComponent implements OnInit {

  activeState: any = 'create_form';

  groupData: any;

  // showHeader variable
  showHeader: any;

  // fileId Variable
  fileId: any;

  // File Data Variable
  file: any

  // Edit Title
  editTitle = false

  // Global File Original Name Varibale
  fileOriginalName: string;

  // Public functions class member
  publicFunctions = new PublicFunctions(this._Injector);

  constructor(
    private flamingoService: FlamingoService,
    private utilityService: UtilityService,
    private router: Router,
    private _ActivatedRoute: ActivatedRoute,
    private _Injector: Injector,
    private titleService: Title
  ) { }

  async ngOnInit() {

    this.showHeader = this.router.url.includes('preview') || this.router.url.includes('answer');

    // Set the groupData
    this.groupData = this.publicFunctions.getCurrentGroupDetails();

    // Set the fileId variable
    this.fileId = this._ActivatedRoute.snapshot.firstChild.paramMap.get('id')

    // Fetch Files Details
    this.file = await this.publicFunctions.getFile(this.fileId)

    // Set the name to keep a track of original_name
    this.fileOriginalName = this.file.original_name

    // Set the White Color of the body
    document.body.style.background = '#ffffff'

    // Change the title of the tab
    this.titleService.setTitle('Octonius | Flamingo - ' + (this.file.original_name || 'New Flamingo'));

    const segments = this._ActivatedRoute?.snapshot['_urlSegment']?.segments;
    this.activeState = segments[2]?.path ? segments[2]?.path : 'create_form';
  }

  /**
   * This function is responsible for taking the user back to their previous locations
   */
  async goBackToFiles() {
    const newGroup = await this.publicFunctions.getGroupDetails(this.file?._group?._id || this.file?._group);
    await this.publicFunctions.sendUpdatesToGroupData(newGroup);
    this.router.navigate(
      ['/dashboard', 'work', 'groups', 'files'],
      {
        queryParams: {
          folder: this.file?._folder?._id || this.file?._folder
        }
      }
    );

    // Change the title of the tab
    this.titleService.setTitle('Octonius');
  }

  /**
   * This function is responsible for editing a file's details
   * @param fileId
   * @param file
   */
  public async edit(fileId: any, file: any) {
    return new Promise((resolve) => {

      // Files Service
      let fileService = this._Injector.get(FilesService);

      // Edit the file details
      fileService.edit(fileId, file)
        .then((res) => {
          resolve(res['file'])
        })
        .catch(() => {
          resolve({})
        })
    })
  }

  enableEdit() {
    if (!(this.activeState=='publish' || this.activeState=='result')) {
      this.editTitle = !this.editTitle;
    }
  }

  /**
   * This function is responsible for handling the changeTitle functionlaity
   * @param event
   */
  async changeTitle(event: any) {

    // KeyCode = 13 - User hits enter
    if (event.keyCode == 13) {

      // Set the edit title to false
      this.editTitle = false

      // Change the title of the tab
      this.titleService.setTitle('Octonius | Folio - ' + (this.file.original_name || $localize`:@@flamingoHeader.newFlamingo:New Flamingo`));

      // Call the HTTP PUT request to change the data on server
      await this.edit(this.fileId, {
        original_name: event.target.value,
        modified_name: event.target.value
      })
    }

    // KeyCode = 27 - User Hits Escape
    else if (event.keyCode == 27) {

      // Set the original_name back to previous state
      this.file.original_name = this.fileOriginalName

      // Only Set the edit title to false
      this.editTitle = false
    }

  }

  ngOnDestroy() {

    // Change the title of the tab
    this.titleService.setTitle('Octonius');
  }

  changeState(state: any) {
    this.activeState = state;
  }

  async exportToExcel() {
    let flamingo: any = await this.publicFunctions.getFlamingo(this.fileId);

    if (flamingo && flamingo?._questions && flamingo?.responses) {
      let insights: any = [];
      let scaleResponses = new Map();

      flamingo?._questions?.forEach(question => {
        const responses = this.getScaleResponses(question._id, flamingo?.responses);
        scaleResponses.set(question._id, responses);
      });

      await flamingo?._questions?.forEach(async question => {
        if (question.type != 'ShortText') {
          let response: any = {
            text: question?.text,
            type: question?.type,
          }

          if (question?.type == 'Yes/No') {
            //response.positive_text = question?.positive_option_text;
            response[question?.positive_option_text] = this.flamingoService.getPositiveResponsesStats(flamingo?.responses, question?._id);
            //response.negative_text = question?.negative_option_text;
            response[question?.negative_option_text] = this.flamingoService.getNegativeResponsesStats(flamingo?.responses, question?._id);
          }

          if (question?.type == 'Scale') {
            let responses = scaleResponses.get(question?._id);
            let sizes = Array.from(new Array(question.scale.size), (x,i) => i);
            let percentages = [];
            let countsData = Array.from(new Array(question.scale.size), (x,i) => {
              return responses?.filter(response => {
                return response.scale_answer == i
              }).length;
            });

            countsData.forEach(count => {percentages?.push((Math.round(((count*100/flamingo?.responses?.length) + Number.EPSILON) * 100) / 100))});

            sizes.forEach((size, index) => {
              //response.size = size;
              response[size] = percentages[index] + ' %';
            });
          }

          if (question?.type == 'Dropdown') {
            question?.options.forEach(option => {
              //response.option = option;
              response[option] = this.flamingoService.getDropdawnResponsesStats(flamingo?.responses, question?._id, option);
            });
          }

          if (question?.type == 'Multiple') {
            question?.options.forEach(option => {
              //response.option = option;
              response[option] = this.flamingoService.getMultipleResponsesStats(flamingo?.responses, question?._id, option);
            });
          }

          insights.push(response);
        }
      });

      let responses = [];

      flamingo?.responses?.forEach(response => {
        let activeResponse: any = {
          created_date: response?.created_date
        }

        response?.answers?.forEach(answer => {
          //activeResponse.text = answer?._question?.text;
          //activeResponse.type = answer?._question?.type;

          if (answer?._question?.type == 'ShortText') {
            activeResponse[answer?._question?.text] = answer?.text_answer;
          }

          if (answer?._question?.type == 'Yes/No') {
            if (answer?.positive_answer) {
              activeResponse[answer?._question?.text] = answer?._question?.positive_option_text;
            }
            if (answer?.negative_answer) {
              activeResponse[answer?._question?.text] = answer?._question?.negative_option_text;
            }
          }

          if (answer?._question?.type == 'Scale') {
            activeResponse[answer?._question?.text] = answer?.scale_answer;
          }

          if (answer?._question?.type == 'Dropdown') {
            activeResponse[answer?._question?.text] = answer?.dropdown_answer;
          }

          if (answer?._question?.type == 'Multiple') {
            let multipleAnswer = '';
            answer?.answer_multiple?.forEach(answerMulti => {
              multipleAnswer += answerMulti + '; ';
            });
            activeResponse[answer?._question?.text] = multipleAnswer;
          }
        });

        responses.push(activeResponse);
      });

      this.saveAsExcelFile(insights, responses, this.file.original_name);
    }
  }

  getScaleResponses(questionId: string, responses: any) {
    return this.flamingoService.getScaleResponses(responses, questionId);
  }

  /**
   * Exports an array into an excel file
   * @param arrayToExport
   * @param fileName
   */
  saveAsExcelFile(insightsArray: any, responsesArray: any, fileName: string): void {
    const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const EXCEL_EXTENSION = '.xlsx';
    const insightsWorksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(insightsArray);
    const responsesWorksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(responsesArray);
    const workbook: XLSX.WorkBook = { Sheets: { 'responses': responsesWorksheet, 'insights': insightsWorksheet }, SheetNames: ['responses', 'insights'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], {type: EXCEL_TYPE});
    fileSaver.saveAs(data, fileName + '_export_' + moment(moment().utc(), "YYYY-MM-DD") + EXCEL_EXTENSION);
  }
}
