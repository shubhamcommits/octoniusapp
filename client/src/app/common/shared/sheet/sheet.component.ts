import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core'
import { FilesService } from 'src/shared/services/files-service/files.service'
import { UtilityService } from 'src/shared/services/utility-service/utility.service'
import { BehaviorSubject } from 'rxjs'
import { MatPaginator } from '@angular/material/paginator'
import { MatSort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import { SubSink } from 'subsink'
import * as XLSX from 'xlsx'

type AOA = any[][]

@Component({
  selector: 'app-sheet',
  templateUrl: './sheet.component.html',
  styleUrls: ['./sheet.component.scss']
})
export class SheetComponent implements OnInit {
  
  // Raw Data of Sheet
  @Input('data') data: any = []
  
  // File
  @Input('file') file: any
  
  // File URL
  @Input('fileUrl') fileUrl: any
  
  // Is member
  @Input('isMember') isMember: boolean
  
  // Sort Table
  @ViewChild(MatSort, { static: true }) sort: MatSort
  
  // Paginator
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator
  
  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' }
  
  fileName: string = 'SheetJS.xlsx'
  
  // Columns
  columns: any = []
  
  // Selected Columns
  selectedColumns: any = []
  
  // Rows Counts for User View
  rows_count = 0
  
  // Datasource
  dataSource = new MatTableDataSource([])
  
  // Subsink class
  subsink = new SubSink()
  
  // Show Analytics
  showAnalytics = false
  
  // Graphs count
  graphs = []
  
  // Chart Data
  public chartLabels = [
    $localize`:@@seet.salesQ1:Sales Q1`,
    $localize`:@@seet.salesQ2:Sales Q2`,
    $localize`:@@seet.salesQ3:Sales Q3`,
    $localize`:@@seet.salesQ4:Sales Q4`
  ];
  public chartData = [120, 150, 180, 90];
  public chartType = 'doughnut';
  
  // Loading Behaviour
  isLoading$ = new BehaviorSubject(false)
  
  constructor(
    public utilityService: UtilityService,
    private _Injector: Injector
  ) { }
  
  ngOnInit(): void {
    if(this.file){
      this.selectedColumns = this.file._campaign_user_view.fields
      this.rows_count = this.file._campaign_user_view.rows_count
    }
  }

  async ngOnChanges() {
    if (this.fileUrl) {
      this.isLoading$.next(true)
      let blob = await this.getBlobFromUrl(this.fileUrl)
      let data = await this.getDataFromBlob(blob)
      this.data = data['array']
      this.columns = data['keys']

      // If user is member
      if(this.isMember == true){
        this.data = this.data.slice(0, this.rows_count)
        this.columns = this.selectedColumns
      }
      this.graphs = []
      this.populateDatasource(this.data)
      this.isLoading$.next(false)
    }
  }

  public filterResults = (value: string, event: any) => {
    if (event.keyCode === 13)
      this.dataSource.filter = value.trim().toLocaleLowerCase()
  }

  /**
   * This function is responsible for creating blob from the FILE
   * @param myImageUrl
   * @returns
   */
  getBlobFromUrl(myImageUrl) {
    return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest();
      request.open('GET', myImageUrl, true);
      request.responseType = 'blob';
      request.onload = () => {
        resolve(request.response);
      };
      request.onerror = reject;
      request.send();
    })
  }

  /**
   * This function is responsible for mapping the blob data into binary file and prepare the data for table
   * @param blob
   * @returns
   */
  getDataFromBlob(blob: any) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onload = (e: any) => {
        /* read workbook */
        const bstr: string = e.target.result
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' })

        /* grab first sheet */
        const wsname: string = wb.SheetNames[0]
        const ws: XLSX.WorkSheet = wb.Sheets[wsname]

        /* save data */
        this.data = (XLSX.utils.sheet_to_json(ws, { header: 1 }))

        resolve(this.convertToJSON(this.data))
      };
      reader.onerror = reject;
      reader.readAsBinaryString(blob)
    })
  }

  populateDatasource(dataSet: any) {
    this.dataSource = new MatTableDataSource(dataSet)
    this.dataSource.sort = this.sort
    this.dataSource.paginator = this.paginator
  }

  convertToJSON(array) {
    var objArray = [];
    for (var i = 1; i < array.length; i++) {
      objArray[i - 1] = {};
      for (var k = 0; k < array[0].length && k < array[i].length; k++) {
        var key = array[0][k];
        objArray[i - 1][key] = array[i][k]
      }
    }

    return { array: objArray, keys: array[0] }
  }

  updateFile(fileId, fileData){
    return new Promise((resolve)=>{
      let filesService = this._Injector.get(FilesService)
      filesService.edit(fileId, fileData)
      .then((res)=>{
        resolve(res['file'])
      })
      .catch(()=>{
        resolve({})
      })
    })
  }

  rowEvents(event) {
    console.log(event)
  }

  async saveSettingsForUserView(){

    // Utility Service
    let utilityService = this._Injector.get(UtilityService)

    // Asynchronously Saving the content
    utilityService.asyncNotification($localize`:@@seet.pleaseWaitSavingSettings:Please wait we are saving the new setting...`,
    new Promise(async (resolve, reject)=>{
      this.file._campaign_user_view = {
        fields: this.selectedColumns,
        rows_count: this.rows_count
      }
      this.updateFile(this.file._id, this.file)
      .then(()=>{
        resolve(utilityService.resolveAsyncPromise($localize`:@@seet.settingsSavedCampaign:Settings saved to your campaign!`));
      })
      .catch(() => reject(utilityService.rejectAsyncPromise($localize`:@@seet.unableToSaveSettingsCampaign:Unable to save the settings to your campaign, please try again!`)))
    }))
  }

  ngOnDestroy() {
    this.subsink.unsubscribe()
  }

}
