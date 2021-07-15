import { Component, Input, OnInit } from '@angular/core'

import * as XLSX from 'xlsx'

type AOA = any[][]

@Component({
  selector: 'app-sheet',
  templateUrl: './sheet.component.html',
  styleUrls: ['./sheet.component.scss']
})
export class SheetComponent implements OnInit {

  constructor() { }

  // Raw Data of Sheet
  @Input('data') data: any = []

  wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' }

  fileName: string = 'SheetJS.xlsx'

  // File 
  @Input('file') file: any

  // File URL
  @Input('fileUrl') fileUrl: any

  ngOnInit(): void { }

  async ngOnChanges() {
    if (this.fileUrl) {
      let blob = await this.getBlobFromUrl(this.fileUrl)
      let data = await this.getDataFromBlob(blob)
    }
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

        resolve(reader.result)
      };
      reader.onerror = reject;
      reader.readAsBinaryString(blob)
    })
  }

  rowEvents(event){
    console.log(event)
  }

}
