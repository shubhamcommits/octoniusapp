import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { MatPaginator } from '@angular/material/paginator'
import { MatSort } from '@angular/material/sort'
import { MatTableDataSource } from '@angular/material/table'
import { ActivatedRoute } from '@angular/router'
import { BehaviorSubject } from 'rxjs'

import * as XLSX from 'xlsx'

type AOA = any[][]

@Component({
  selector: 'app-sheet',
  templateUrl: './sheet.component.html',
  styleUrls: ['./sheet.component.scss']
})
export class SheetComponent implements OnInit {

  constructor(
    private _Injector: Injector,
    public _Dialog: MatDialog,
    private _ActivatedRoute: ActivatedRoute,
  ) { }

  // Raw Data of Sheet
  @Input('data') data: any = []

  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' }

  fileName: string = 'SheetJS.xlsx'

  // File 
  @Input('file') file: any

  // File URL
  @Input('fileUrl') fileUrl: any

  // Is loading behaviour
  isLoading$ = new BehaviorSubject(false)

  // Columns
  displayedColumns: any = []

  // Datasource
  dataSource = new MatTableDataSource([])

  // Sort Table
  @ViewChild(MatSort, { static: true }) sort: MatSort

  // Paginator
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator

  ngOnInit(): void {}

  async ngOnChanges() {
    if (this.fileUrl) {
      let blob = await this.getBlobFromUrl(this.fileUrl)
      let data = await this.getDataFromBlob(blob)
      console.log(this.data)
      this.calculateData()
    }
  }

  /**
   * Calculate Data Function
   */
  async calculateData(){
    this.populateDatasource(this.data)
  }

  /**
   * This function populates the dataset
   * @param dataSet 
   */
  populateDatasource(dataSet: any) {
    this.dataSource = new MatTableDataSource(dataSet)
    this.dataSource.sort = this.sort
    this.dataSource.paginator = this.paginator
  }

  /**
   * Filter result function
   * @param value 
   * @param event 
   */
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
        this.displayedColumns = (XLSX.utils.sheet_to_json(ws, { header: 1 })[0])

        resolve(reader.result)
      };
      reader.onerror = reject;
      reader.readAsBinaryString(blob)
    })
  }

}
