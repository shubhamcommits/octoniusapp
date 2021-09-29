import { Injector, AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PublicFunctions } from "modules/public.functions";
import { ActivatedRoute } from "@angular/router";
import { SubSink } from "subsink";
import { environment } from "src/environments/environment";
import ReconnectingWebSocket from "reconnecting-websocket";
import * as ShareDB from "sharedb/lib/client";
import { FilesService } from "src/shared/services/files-service/files.service";

declare const Quill2: any;
declare const quillBetterTable: any
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

  constructor(
    private httpClient: HttpClient,
    private _Injector: Injector,
    private _ActivatedRoute: ActivatedRoute,
  ) {
    // Get the State of the ReadOnly
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
        ['clean'], ['comment'],['clear']
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
    };
  }

  ngOnInit() {
    this.folio = this.initializeConnection();
    
  }

  async ngAfterViewInit() {
    // Fetch User Data
    if (!this.readOnly) {
      this.userData = await this.publicFunctions.getCurrentUser();
      console.log("userData : ",this.userData);
      // check if the user is part of the group of the folio
      const groupIndex = await this.userData?._groups?.findIndex((group) => {
        return (group._id || group) == this.groupId;
      });
      this.readOnly = this.readOnly || groupIndex < 0;
    }

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
      console.log(folio.type);
      if (!folio.type) {
        folio.create({ data: { comment: [], delta: [{ insert: "\n" }] } });
        console.log("creating folio");
      }
      console.log("folio data : ", folio.data.data);
      // update editor contents
      quill.setContents(folio.data.data.delta);
      this.metaData = folio.data.data.comment;
      // local -> server
      quill.on("text-change", (delta, oldDelta, source) => {
        console.log("delta : ", delta);
        console.log("old delta : ", oldDelta);
        console.log("source : ", source);

        if (source == "user") {
          console.log("to send ops : ", delta.ops);
          console.log("quill contents : ", quill.getContents().ops);
          var toSend = {
            p: ["data"],
            od: folio.data.data,
            oi: { comment: this.metaData, delta: quill.getContents().ops },
          };
          console.log("to send : ", toSend);
          folio.submitOp(
            toSend,
            {
              source: quill,
            },
            (err: Error) => {
              if (err) console.error("Submit OP returned an error:", err);
            }
          );
          console.log("sent");
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
        console.log("server -> local : ", op[0].oi.delta);
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
      console.log(index);
      if(found) this.commentsToDisplay.push(index);
    });
    console.log(this.commentsToDisplay);
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
    console.log(this.metaData[this.commentToDelete]);
    var commentData = this.metaData[this.commentToDelete];
    this.quill.formatText(commentData.range.index, commentData.range.length, {
      background: "white",
    });
    this.metaData.splice(this.commentToDelete, 1);
    var toSend = {
      p: ["data"],
      od: this.folio.data.data,
      oi: { comment: this.metaData, delta: this.quill.getContents().ops },
    };
    console.log("to send : ", toSend);
    this.folio.submitOp(
      toSend,
      {
        source: this.quill,
      },
      (err: Error) => {
        if (err) console.error("Submit OP returned an error:", err);
        return;
      }
    );
    this.commentToDelete = null;
    this.deleteCommentBool = false;
  }

  //Opens dialog box to enter commment
  openComment() {
    this.commentBool = true;
    this.range = this.quill.getSelection(true);
    this.selectedText = this.quill.getText(this.range.index, this.range.length);
  }

  //Validates comment content and adds the comment
  submitComment() {
    console.log(this.enteredComment);
    var txt = null;
    if (this.selectedText == null || this.selectedText == "") {
      txt = "No content is selected";
      alert(txt);
    } else if (this.enteredComment == null || this.enteredComment == "") {
      txt = "Please enter the comment";
      alert(txt);
    } else {
      var userName = this.userData.first_name + ' ' + this.userData.last_name;
      this.metaData.push({ range: this.range, comment: this.enteredComment, user_name : userName, profile_pic : this.userData.profile_pic });
      this.quill.formatText(this.range.index, this.range.length, {
        background: "#fff72b",
      });
      var toSend = {
        p: ["data"],
        od: this.folio.data.data,
        oi: { comment: this.metaData, delta: this.quill.getContents().ops },
      };
      console.log("to send : ", toSend);
      this.folio.submitOp(
        toSend,
        {
          source: this.quill,
        },
        (err: Error) => {
          if (err) console.error("Submit OP returned an error:", err);
          return;
        }
      );
      this.commentBool = false;
      this.selectedText = null;
      this.enteredComment = null;
    }
  }

  //Closes the comment dialog box
  closeComment() {
    this.commentBool = false;
    this.selectedText = null;
    this.enteredComment = null;
  }

  //Clears the entire editor
  clearEditor() {
    this.quill.deleteText(0, this.quill.getLength());
    this.metaData = [];
    var toSend = {
      p: ["data"],
      od: this.folio.data.data,
      oi: { comment: this.metaData, delta: this.quill.getContents().ops },
    };
    console.log("to send : ", toSend);
    this.folio.submitOp(
      toSend,
      {
        source: this.quill,
      },
      (err: Error) => {
        if (err) console.error("Submit OP returned an error:", err);
      }
    );
  }

  //Highlights the text in given range
  highlight(range: any) {
    this.quill.setSelection(range.index, range.length);
  }
}
