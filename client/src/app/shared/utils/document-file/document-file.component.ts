import { Component, OnInit,EventEmitter,ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentService } from '../../services/document.service';
import { DocumentFileService } from '../../services/document-file.service';

@Component({
  selector: 'app-document-file',
  templateUrl: './document-file.component.html',
  //template: `<div>${editorAsFile.outerHTML}</div>`,
  styleUrls: ['./document-file.component.scss']
})
export class DocumentFileComponent implements OnInit {
  quill: any;
  postId: any;
  groupId: any;
  document_name:String;

  public _editorData: string = "";
  public _editorDataArray = new Array(1).fill("")
  public _listArrayForPageCheck = new Array(1).fill("0")
  isShowing:Boolean = true
  currentpage = 0


  // @Output() clickBack: EventEmitter<any> = new EventEmitter();

  constructor(private _activatedRoute: ActivatedRoute, 
    private _router: Router,
    private documentService: DocumentService,
    private documentFileService: DocumentFileService,
    private changeDetector: ChangeDetectorRef) { 
    //this.documentHTML = this._activatedRoute.snapshot.queryParamMap.get('html') || '<div>Please Export your Document!</div>';
    this.postId = this._activatedRoute.snapshot.paramMap.get('postId')
    this.groupId = this._activatedRoute.snapshot.paramMap.get('id');
    this.getDocument();
  }

  async ngOnInit() {
   //await this.getDocument();
  }

  getDocument(){
      this.documentFileService.getDocumentFile(this.postId)
      .subscribe((res)=>{
        this.document_name = res['file'][0]['_name']
        var docTypeValue = `<!DOCTYPE html><html><head></head><body>${res['file'][0]['_content']}</body></html>`
        var pars = (new DOMParser()).parseFromString(docTypeValue, "text/html");
        var x = pars.documentElement.childNodes;
    
        for (let i = 0; i < x.length ; i++) {
          const innerFirstElementNode = Array.from(x[i].childNodes)
            for (let k = 0; k < innerFirstElementNode.length; k++){
     
              var el = document.createElement("div");
            
                el.appendChild(innerFirstElementNode[k])
                this._editorDataArray[this.currentpage] += el.innerHTML
            
              
              this.changeDetector.detectChanges()
              var pagePreviewHeight = document.getElementsByClassName('pagePreview')[this.currentpage].clientHeight;
              //console.log(pagePreviewHeight,"height")
              if (pagePreviewHeight <= 1100){
                if (k >= innerFirstElementNode.length - 1){
                  this._listArrayForPageCheck[this.currentpage] = "29.7"
                }
                
              }
              if (pagePreviewHeight > 1100){
              //last element added
                this._editorDataArray[this.currentpage].replace(el.innerHTML,"")
     ///////// new one here
                 this.currentpage += 1
                this._editorDataArray = [...this._editorDataArray, ""]
                this._listArrayForPageCheck = [...this._listArrayForPageCheck, "0"]
              }
              
            }
        }
        
      }, (err)=>{
        console.log('Error occured while fetching the document', err);
      })

  }
  clickOnBack(){
   this._router.navigate(['dashboard', 'group', this.groupId, 'files']);
  }

}
