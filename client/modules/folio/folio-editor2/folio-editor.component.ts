import { Injector, AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PublicFunctions } from "modules/public.functions";
import { ActivatedRoute } from "@angular/router";
import { SubSink } from "subsink";
import { environment } from "src/environments/environment";
import ReconnectingWebSocket from "reconnecting-websocket";
import * as ShareDB from "sharedb/lib/client";
import { FilesService } from "src/shared/services/files-service/files.service";
import { StorageService } from "src/shared/services/storage-service/storage.service";
import { FolioService } from 'src/shared/services/folio-service/folio.service';

declare const Quill2: any;
declare const quillBetterTable: any;
Quill2.register({
  'modules/better-table': quillBetterTable,
}, true);

@Component({
  selector: "app-folio-editor",
  templateUrl: "./folio-editor.component.html",
  styleUrls: ["./folio-editor.component.scss"],
})
export class FolioEditorComponent implements OnInit, AfterViewInit {
  // Quill instance variable
  quill: any;
  quill2: any;
  // Quill modules variable
  modules: any;

  // Public functions class member
  publicFunctions = new PublicFunctions(this._Injector);

  //Comments to Display
  commentsToDisplay = [];

  //Comments MetaData
  metaData = [];

  //Range for selected text
  range : {index : number, length : number};

  //To bind selected text
  selectedText: string;

  //To bind entered comment
  enteredComment: string;

  //Comment modal boolean
  commentBool: boolean = false;

  // Table modal boolean
  tableShow: boolean = false;


  //Delete comment modal boolean
  deleteCommentBool : boolean = false;

  //comment To Delete
  commentToDelete : number;

  // User Data Variable
  userData: any;
  
  // ShareDB Variable
  shareDBSocket: any;
  
  // Websocket Options
  webSocketOptions = {
    // WebSocket: undefined,
    // maxReconnectionDelay: 10000,
    // minReconnectionDelay: 1000 + Math.random() * 4000,
    // reconnectionDelayGrowFactor: 1.3,
    // minUptime: 5000,
    // connectionTimeout: 4000,
    // maxRetries: Infinity,
    // debug: false,
    //startClosed: false
  };

  // Folio Variable
  folio: any;

  // Folio ID Variable
  folioId = this._ActivatedRoute.snapshot.paramMap.get("id");

  // GroupId variable
  groupId = this._ActivatedRoute.snapshot.queryParamMap.get("group");

  // Read Only State of the folio
  readOnly = true;

  // SubSink Variable
  subSink = new SubSink();

  // Uploads url for Files
  filesBaseUrl = environment.UTILITIES_FILES_UPLOADS;

  @ViewChild('editable', { static: true })
  editRef!: ElementRef;

  @ViewChild('editable2', { static: true })
  editRef2!: ElementRef;

  constructor(
    private _Injector: Injector,
    private _ActivatedRoute: ActivatedRoute,
    private follioService: FolioService
  ) {
    // Get the State of the ReadOnly
    follioService.follioSubject.subscribe(data => {
      if (data){
        this.quill.clipboard.dangerouslyPasteHTML(data);
        this.saveQuillData();
      }
    })
    this.readOnly =
      this._ActivatedRoute.snapshot.queryParamMap.get("readOnly") == "true" ||
      false;

    // Initialise the modules in constructor
    this.modules = {
      syntax: true,
      toolbar: [
        [{ 'font': [] }, { 'size': [] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'super' }, { 'script': 'sub' }],
        [{ 'header': '1' }, { 'header': '2' }, 'blockquote', 'code-block'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        ['direction', { 'align': [] }],
        ['link', 'image', 'video', 'formula'],
        ['clean'], ['comment'],['tables'],['clear']
      ],
      table: false,
        'better-table': {
          operationMenu: {
            items: {
              unmergeCells: {
                text: 'Another unmerge cells name'
              }
            },
            color: {
              colors: ['green', 'red', 'yellow', 'blue', 'white'],
              text: 'Background Colors:'
            }
          }
        },
        keyboard: {
          bindings: quillBetterTable.keyboardBindings
        },
      history: {
        delay: 2500,
        userOnly: true,
      },
      mention: {}
    };
  }

  ngOnInit() {
    this.folio = this.initializeConnection();
    
  }

  async ngAfterViewInit() {
    // Fetch User Data
    if (!this.readOnly) {
      this.userData = await this.publicFunctions.getCurrentUser();
      // check if the user is part of the group of the folio
      const groupIndex = await this.userData?._groups?.findIndex((group) => {
        return (group._id || group) == this.groupId;
      });
      this.readOnly = this.readOnly || groupIndex < 0;
    }
    this.modules.mention = this.metionModule();
    this.initEditor();
    this.initializeFolio(this.folio, this.quill);
    document.querySelector(".ql-comment").innerHTML =
      '<img src="assets/images/comment.png" alt="" style="height:100%; width:100%"></div>';
    document.querySelector(".ql-clear").innerHTML = "<b>Clr</b>";

    document.querySelector(".ql-comment").addEventListener("click", () => {
      this.openComment();
    });

    document.querySelector(".ql-clear").addEventListener("click", () => {
      this.clearEditor();
    });

    document.querySelectorAll('.ql-tables').forEach(button => {
      button.innerHTML = '<svg viewBox="0 0 18 18"> <rect class="ql-stroke" height="12" width="12" x="3" y="3"></rect> <rect class="ql-fill" height="2" width="3" x="5" y="5"></rect> <rect class="ql-fill" height="2" width="4" x="9" y="5"></rect> <g class="ql-fill ql-transparent"> <rect height="2" width="3" x="5" y="8"></rect> <rect height="2" width="4" x="9" y="8"></rect> <rect height="2" width="3" x="5" y="11"></rect> <rect height="2" width="4" x="9" y="11"></rect> </g> </svg>'
      button.addEventListener('click', () => {
        this.openTableOptions()    
      });
     });


  }

  ngOnDestroy() {
    this.subSink.unsubscribe();
    this.shareDBSocket?.close();
  }

  initEditor(): void {    
    this.quill = new Quill2(this.editRef.nativeElement, {
      theme: 'snow',
      modules: this.modules,
    });

    this.quill2 = new Quill2(this.editRef2.nativeElement,{
      theme: 'snow',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline']
        ],
        mention : this.metionModule()
      }
    })
  }

  initializeConnection() {
    // Connect with the Socket Backend
    this.shareDBSocket = new ReconnectingWebSocket(
      environment.FOLIO_BASE_URL + "/editor",
      [],
      this.webSocketOptions
    );

    // Initialise the Realtime DB Connection
    let shareDBConnection = new ShareDB.Connection(this.shareDBSocket);

    // Return the Document with the respective folioId
    return shareDBConnection.get("documents", this.folioId);
  }

  initializeFolio(folio: any, quill: any) {
    // Subscribe to the folio data and update the quill instance with the data
    folio.subscribe(async () => {
      if (!folio.type) {
        folio.create({ data: { comment: [], delta: [{ insert: "\n" }] } });
      }
      // update editor contents
      quill.setContents(folio.data.data.delta);
      this.quill2.setContents([{ insert: "\n" }]);
      this.metaData = folio.data.data.comment;
      // local -> server
      quill.on("text-change", (delta, oldDelta, source) => {
        if (delta.ops.length > 1 && delta.ops[1].insert) {
          let mentionMap = JSON.parse(JSON.stringify(delta.ops[1].insert));
          if (mentionMap.mention && mentionMap.mention.denotationChar === "@") {
            let filesService = this._Injector.get(FilesService);
            filesService
              .newFolioMention(
                mentionMap.mention,
                this.folioId,
                this.userData._id
              )
              .then((res) => res.subscribe());
          }
        }
        if (source == "user") {
          this.saveQuillData()
        }
      });

      quill.on("selection-change",(range, oldRange, source) => {
        if(range != null) {
          this.commentsToDisplay = [];
          this.mapComments(range.index, range.length);
        }
      })
      // server -> local
      folio.on("op", (op, source) => {
        if (source === quill) return;
        quill.setContents(op[0].oi.delta);
        this.metaData = op[0].oi.comment;
      });
    });
  }

  //To get comments on selection
  mapComments(index : number, length : number) {
    var selectedIndexes = this.generateIndexes(index, length);
    this.metaData.forEach((value, index) => {
      var valueIndexes = this.generateIndexes(value.range.index, value.range.length);
      var found = false
      valueIndexes.forEach((val) => {
        if (selectedIndexes.includes(val)) {
          found = true;
        }
      })
      if(found) this.commentsToDisplay.push(index);
    });
  }

  generateIndexes(index : number, length : number) {
    var arr = [];
    for(var i = index; i <= index+length; i++) {
      arr.push(i);
    }
    return arr;
  }

   //Opens confirmation dialog for deleting comment
   openDeleteComment(index: any) {
    this.deleteCommentBool = true;
    this.commentToDelete = index;
  }

  //Cancels deleting comment procedure
  onDeleteCancel(){
    this.commentToDelete = null;
    this.deleteCommentBool = false;
  }

  //Deletes the comment on confirmation
  onDeleteConfirm(){
    var commentData = this.metaData[this.commentToDelete];
    this.quill.formatText(commentData.range.index, commentData.range.length, {
      background: "white",
    });
    this.metaData.splice(this.commentToDelete, 1);
    this.saveQuillData();
    this.commentToDelete = null;
    this.deleteCommentBool = false;
  }

  saveQuillData() {
    var toSend = {
      p: ["data"],
      od: this.folio.data.data,
      oi: { comment: this.metaData, delta: this.quill.getContents().ops },
    };
    this.folio.submitOp(
      toSend,
      {
        source: this.quill,
      },
      (err: Error) => {
        return;
      }
    );
  }

  //Opens dialog box to enter commment
  openComment() {
    this.commentBool = true;
    this.range = this.quill.getSelection(true);
    this.selectedText = this.quill.getText(this.range.index, this.range.length);
  }

  //Validates comment content and adds the comment
  submitComment() {
    this.enteredComment = this.quill2.root.innerHTML;
    var txt = null;
    if (this.selectedText == null || this.selectedText == "") {
      txt = "No content is selected";
      alert(txt);
    } else if (this.enteredComment == null || this.enteredComment == "") {
      txt = "Please enter the comment";
      alert(txt);
    } else {
      var userName = this.userData.first_name + ' ' + this.userData.last_name;
      this.quill2.getContents().ops.map((value)=>{
        if(value.insert.mention){
          var mentionMap = value.insert;
          if (mentionMap.mention && mentionMap.mention.denotationChar === "@") {
            let filesService = this._Injector.get(FilesService);
            filesService
              .newFolioMention(
                mentionMap.mention,
                this.folioId,
                this.userData._id
              )
              .then((res) => res.subscribe());
          }
        }
      });
      this.metaData.push({ range: this.range, comment: this.enteredComment, user_name : userName, profile_pic : this.userData.profile_pic });
      this.quill.formatText(this.range.index, this.range.length, {
        background: "#fff72b",
      });
      this.saveQuillData();
      this.quill2.deleteText(0, this.quill2.getLength());
      this.commentBool = false;
      this.selectedText = null;
      this.enteredComment = null;
    }
  }

  //Closes the comment dialog box
  closeComment() {
    this.quill2.deleteText(0, this.quill2.getLength());
    this.commentBool = false;
    this.selectedText = null;
    this.enteredComment = null;
  }

  //Clears the entire editor
  clearEditor() {
    this.quill.deleteText(0, this.quill.getLength());
    this.metaData = [];
    this.saveQuillData()
  }

  //Highlights the text in given range
  highlight(range: any) {
    this.quill.setSelection(range.index, range.length);
  }

  // Open Table input options dialoge
  openTableOptions() {
    this.tableShow= true;  
  }

  // Get user's input from the create-table modal
  dataFromTableModal(data:any){    
    this.tableShow= false;
    if(data){
      this.createTable(data.rowCount,data.columnCount)
    }
  }
  // Create table with specific values
  createTable(rowCount:number,columnCount:number ){
    const tableModule = this.quill.getModule('better-table');
      tableModule.insertTable(rowCount, columnCount);
  }
  
  metionModule() {
    return {
      allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
      mentionDenotationChars: ["@", "#"],
      source: async (searchTerm, renderList, mentionChar) => {
        // Value of the mention list
        let values: any;

        // If User types "@" then trigger the list for user mentioning
        if (mentionChar === "@") {
          // Initialise values with list of members
          values = await this.suggestMembers(this.groupId, searchTerm);

          // Adding All Object to mention all the members
          values.unshift({
            id: "all",
            value: "all",
          });
          // If User types "#" then trigger the list for files mentioning
        } else if (mentionChar === "#") {
          // Initialise values with list of files
          values = await this.suggestFiles(this.groupId, searchTerm);
        }

        // If searchTerm length is 0, then show the full list
        if (searchTerm.length === 0) {
          renderList(values, searchTerm);
        } else {
          const matches = [];
          for (let i = 0; i < values.length; i++)
            if (
              ~values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())
            )
              matches.push(values[i]);
          renderList(matches, searchTerm);
        }
      },
    };
  }

  async suggestMembers(groupId: string, searchTerm: string) {
    // Fetch the users list from the server
    let usersList: any = await this.publicFunctions.searchGroupMembers(
      groupId,
      searchTerm
    );

    // Map the users list
    usersList = usersList["users"].map((user) => ({
      id: user._id,
      value: user.first_name + " " + user.last_name,
    }));

    // Return the Array without duplicates
    return Array.from(new Set(usersList));
  }

  async suggestFiles(groupId: string, searchTerm: string) {
    // Storage Service Instance
    let storageService = this._Injector.get(StorageService);

    // Fetch the users list from the server
    let filesList: any = await this.publicFunctions.searchFiles(
      groupId,
      searchTerm,
      "true"
    );

    // Map the users list
    filesList = filesList.map((file: any) => ({
      id: file._id,
      value:
        file.type == "folio"
          ? `<a href="/document/${file._id}?group=${file._group._id}&readOnly=true" style="color: inherit" target="_blank">${file.original_name}</a>`
          : `<a href="${this.filesBaseUrl}/${
              file.modified_name
            }?authToken=Bearer ${
              storageService.getLocalData("authToken")["token"]
            }" style="color: inherit" target="_blank">${
              file.original_name
            }</a>`,
    }));

    // Return the Array without duplicates
    return Array.from(new Set(filesList));
  }
}
