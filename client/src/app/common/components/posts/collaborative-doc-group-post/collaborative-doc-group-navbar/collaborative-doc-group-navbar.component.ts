import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { PostService } from '../../../../../shared/services/post.service';
import { GroupService } from '../../../../../shared/services/group.service';
import { ActivatedRoute, Router } from '@angular/router';
import { editor, editorAsFile } from '../collaborative-doc-group-post.component';
import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { DocumentService } from '../../../../../shared/services/document.service';
import saveAs from 'file-saver'
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import { GroupsService } from '../../../../../shared/services/groups.service';
import { DocumentFileService } from '../../../../../shared/services/document-file.service';
import { SnotifyService, SnotifyPosition, SnotifyToastConfig } from 'ng-snotify';

@Component({
  selector: 'app-collaborative-doc-group-navbar',
  templateUrl: './collaborative-doc-group-navbar.component.html',
  styleUrls: ['./collaborative-doc-group-navbar.component.scss']
})
export class CollaborativeDocGroupNavbarComponent implements OnInit {

  document_name = 'Untitled';
  document_content = '';
  document: any;
  ngUnsubscribe = new Subject();
  editing_title = false;

  postId: any;
  groupId: any;
  userId: any;

  @Input() post: any;

  @Input() docStatus: any;

  authorsList: any;

  agoras: any = [];

  @Output() clickBack: EventEmitter<any> = new EventEmitter();

  @Output() docTitle: EventEmitter<any> = new EventEmitter();

  @Output() clickPreview: EventEmitter<any> = new EventEmitter();

  constructor(private postService: PostService,
    private activatedRoute: ActivatedRoute,
    private documentService: DocumentService,
    private groupService: GroupService,
    private groupsService: GroupsService, 
    private router: Router,
    private documentFileService: DocumentFileService,
    private snotifyService: SnotifyService,) {
      this.userId = this.activatedRoute.snapshot.paramMap.get('id')
      this.postId = this.activatedRoute.snapshot.paramMap.get('postId');
      this.groupId = this.activatedRoute.snapshot['_urlSegment']['segments'][2].path;
      //call authors first to set list
      this.documentService.getAuthors(this.postId).subscribe((authorsDataCheck)=>{
        this.authorsList = authorsDataCheck['authors']
        //console.log(this.authorsList)
      })
      //subscribe check for stream
      this.documentService.authorsList$.subscribe((dataList)=>{
        //if the stream has users connected
        if(dataList.connections.length > 0){    
          //console.log(dataList.connections)      
          if (this.authorsList && this.authorsList.length > 0){
            //loop through data list to check if new users are in it 
            for(let i=0;i<dataList.connections.length;i++){
              var userIsNew = true
              //loop checking authors from data list 
              for(let x=0;x<this.authorsList.length;x++){
                if(dataList.connections[i].user_id == this.authorsList[x]._user_id || dataList.connections[i].user_id == this.authorsList[x].user_id){
                  userIsNew = false
                  break
                }
              }
              //after loop if user is new add it to authors list
              if(userIsNew === true){
                this.authorsList.push(dataList.connections[i])
                //console.log(this.authorsList)
              }
            }
          }else{
          //authorslist is null and list is 0 means a user is first to join the first stream
            this.authorsList = dataList.connections
          }
        }
        this.authorsList = this.postService.removeDuplicates(this.authorsList, '_user_id');
      })
       
     }
  ngOnInit() {
    this.getPost();
    this.documentService.getPublicGroups()
    .subscribe((res)=>{
      console.log('Agoras List', res);
      this.agoras = res['groups']
    }, (err)=>{
      console.log('Error occured while fetching agoras', err);
    })
    /*this.getPost();
    setTimeout(() => {
      console.log('Post', this.post);
    }, 5000);*/
    
  }

  exportDOC(){
    let doc = new DOMParser().parseFromString('<div>'+editor+'</div>', 'text/html');

    function Export2Doc(filename = ''){
      var preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
      var postHtml = "</body></html>";
      var html = preHtml + doc.body.innerHTML + postHtml;
  
      var blob = new Blob(['\ufeff', html], {
          type: 'application/msword'
      });
      
      // Specify link url
      var url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);
      
      // Specify file name
      filename = filename?filename+'.doc':'document.doc';
      
      // Create download link element
      var downloadLink = document.createElement("a");
  
      document.body.appendChild(downloadLink);
      
      if(navigator.msSaveOrOpenBlob ){
          navigator.msSaveOrOpenBlob(blob, filename);
      }else{
          // Create a link to the file
          downloadLink.href = url;
          
          // Setting the file name
          downloadLink.download = filename;
          
          //triggering the function
          downloadLink.click();
      }
      
      document.body.removeChild(downloadLink);
  }

  Export2Doc(this.document_name);
  
  }
 exportDOCX(){
    let doc = new DOMParser().parseFromString('<div>'+editor+'</div>', 'text/html');
    var Export2DocX = (filename = '') => {
      //get editor html
      this.groupService.serveDocFileForEditorExport(this.postId,this.groupId, doc.body.innerHTML)
      .subscribe((res) => {
        // console.log(res)
        this.groupService.downloadGroupFile(`${this.groupId}`,res["fileName"])
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((file_toDownload) => {
          saveAs(file_toDownload, filename);
        }, (err) => { });
        
      }, (err) => {
        console.log("error",err)
      });
    }
  Export2DocX(this.document_name+'.docx');
  }
  
  exportPDF(){
    let doc = new DOMParser().parseFromString('<div>'+editor+'</div>', 'text/html');

    let pdf = new jsPDF();

    let specialElementHandlers = {
      '#editor': function(element, renderer){
        return true;
      }
    }

    let docName= this.document_name;

    let margins = {
      top: 15,
      bottom: 15,
      left: 15,
      width: 175
    };

    pdf.fromHTML(doc.body.innerHTML, 15, 15, {
      'width': 180,
      'align': 'justify',
      'elementHandlers': specialElementHandlers
    }, function(res){
      //pdf.autoPrint({variant: 'non-conform'});
      pdf.save(docName+'.pdf');
      //console.log('Response from PDF', res);
    }, margins)

  
  }

  exportAGORA(agoraID,agoraGroupName){
    let doc = document.createElement('html');
    doc = editorAsFile;
    console.log('Document', doc);
      var elements = doc.getElementsByClassName("mention");
      while(elements.length > 0){
          elements[0].parentNode.removeChild(elements[0]);
      };
      let documentFileData = {
        _post_id: this.postId,
        _name: this.document_name,
        _content: doc.outerHTML,
        _group_id : agoraID
      };
      this.documentFileService.getDocumentFile(this.postId)
      .subscribe((res)=>{
        if(res['file'] && res['file'].length > 0){
          console.log('File Found', res);
          this.documentFileService.editDocumentFile(this.postId, documentFileData)
          .subscribe((res)=>{
            this.snotifyService.success(`${this.document_name} was published to ${agoraGroupName}`, {
              timeout: 1500,
              showProgressBar: false,
            });
            // console.log('Document File Edited', res);
            // this.router.navigate(['dashboard', 'group', agoraID, 'files', this.postId]);

          }, (err)=>{
            //console.log('Error while editing the document file', err);
            this.snotifyService.error(`Error publishing ${this.document_name} to ${agoraGroupName}`, {
              timeout: 1500,
              showProgressBar: false,
            });
          })
        }
        else{
         this.documentFileService.createDocumentFile(documentFileData)
         .subscribe((res)=>{
          //  console.log('Document File created', res);
          //  this.router.navigate(['dashboard', 'group', agoraID, 'files', this.postId]);
          this.snotifyService.success(`${this.document_name} was published to ${agoraGroupName}`, {
            timeout: 1500,
            showProgressBar: false,
          });
         }, (err)=>{
           //console.log('Error while creating the document file', err);
           this.snotifyService.error(`Error publishing ${this.document_name} to ${agoraGroupName}`, {
            timeout: 1500,
            showProgressBar: false,
          });
         })
        }
      }, (err)=>{
        console.log('Error while finding the document file', err);
      })
  }

  clickOnBack(){
    // this.getDocument(this.postId).then(()=>{
    //   //this.saveTitle();
    // });
    this.clickBack.emit('Click on back');
  }

  clickOnPreview(){
    this.clickPreview.emit('Click on preview');
  }

  getDocument(postId){
    return new Promise((resolve, reject)=>{
      this.postService.getDocument(postId)
      .subscribe((res)=>{
        //console.log('Document From Navbar', res);
        this.document = res['document'];
        resolve();
      }, (err)=>{
        console.log('Error while fetching the document', err);
        reject(err);
      })
    })

  }

  getPost(){
    this.postService.getPost(this.postId)
    .subscribe((res)=>{
      //console.log('Fetched post', res);
      this.document_name = res['post']['title'];
      //this.document_content = res['post']['content'];
    }, (err)=>{
      console.log('Error while fetching the post', err);
    })
  }

  saveTitle(){
      const post = {
        'title': this.document_name,
        'content': '',
        'type': 'document'
      };
     // console.log(post);
      this.postService.editPost(this.postId, post)
      .subscribe((res)=>{
        //console.log('Title saved', res);
        this.docTitle.emit(post['title']);
        this.document_name = res['post']['title'];
      }, (err)=>{
        console.log('Error while saving the title', err);
      })

    this.editing_title = false;

  }

}
