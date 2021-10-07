import {
  Component,
  OnInit,
  Input,
  Injector,
  OnDestroy,
  AfterViewInit,
} from "@angular/core";

import { ActivatedRoute } from "@angular/router";

import { HttpClient } from "@angular/common/http";

// Public Functions
import { PublicFunctions } from "modules/public.functions";

// Reconnecting WebSockets
import ReconnectingWebSocket from "reconnecting-websocket";

// ShareDB Client
import * as ShareDB from "sharedb/lib/client";

// Register the Types of the Sharedb
ShareDB.types.register(require('rich-text').type);

// Environment Variables
import { environment } from "src/environments/environment";

// Highlight.js
import * as hljs from "highlight.js";

// Highlight.js sublime css
import "highlight.js/styles/monokai-sublime.css";

// Configure hljs for languages
hljs.configure({
  languages: [
    "javascript",
    "ruby",
    "bash",
    "cpp",
    "cs",
    "css",
    "dart",
    "dockerfile",
    "dos",
    "excel",
    "fortran",
    "go",
    "java",
    "nginx",
    "python",
    "objectivec",
    "yaml",
    "yml",
  ],
});

// Quill Import
import Quill from "quill";

// Import Quill Cursors
import QuillCursors from "quill-cursors";

// Imporrt Quill Autoformat module
import Autoformat from "src/app/common/shared/quill-modules/quill-auto-format";

// Register Quill Modules
Quill.register({
  "modules/cursors": QuillCursors,
  "modules/autoformat": Autoformat,
});

// Subsink Class
import { SubSink } from "subsink";

// Import Quill Editor Component
import { QuillEditorComponent } from "src/app/common/shared/quill-editor/quill-editor.component";
import { FilesService } from "src/shared/services/files-service/files.service";
import { StorageService } from "src/shared/services/storage-service/storage.service";

@Component({
  selector: "app-folio-editor",
  templateUrl: "./folio-editor.component.html",
  styleUrls: ["./folio-editor.component.scss"],
})
export class FolioEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  // EditorId variable
  @Input("editorId") editorId: any = "normal-editor";

  // ShowToolbar variable
  @Input("toolbar") toolbar = true;

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

  //Mention in comment boolean
  mentionCommentUser : boolean = false;
  mentionCommentFile : boolean = false;

  //To handle mention text
  mentionText : string = '';

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

  // Create new Object of quillEditorComponent
  quillEditorComponent = new QuillEditorComponent(this._Injector);

  // Uploads url for Files
  filesBaseUrl = environment.UTILITIES_FILES_UPLOADS;

  constructor(
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
      toolbar: this.toolbar,
      cursors: {
        hideDelayMs: 5000,
        hideSpeedMs: 0,
        transformOnTextChange: true,
        autoRegisterListener: false,
      },
      history: {
        delay: 2500,
        userOnly: true,
      },
      autoformat: true,
      mention: {},
    };
  }

  async ngOnInit() {
    // Initialise the connection for folio
    this.folio = this.initializeConnection();

    // If the toolbar is supposed to be visible, then enable following modules
    if (this.toolbar) {
      // Set Image Resize Module
      this.modules.imageResize = this.quillEditorComponent.quillImageResize();

      // Set Image Drop Module
      this.modules.imageDrop = true;

      // Set Image Compression Module
      this.modules.imageCompress =
        this.quillEditorComponent.quillImageCompress();
    }

    // Set the White as the background color for quill
    // document.body.style.setProperty('background', '#ffffff', 'important')
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

    // Set the Status of the toolbar
    this.modules.toolbar =
      this.toolbar === false
        ? false
        : this.quillEditorComponent.quillFullToolbar();

    // Set the Mention Module
    this.modules.mention = this.metionModule();

    // Initialise quill editor
    this.quill = this.quillEditor(this.modules);

    // Create the Cursor
    if (!this.readOnly)
      var cursor = this.createCursor(this.quill, this.userData);

    //
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

  /**
   * This function is responsible for closing the socket on destroying the component
   */
  ngOnDestroy() {
    this.subSink.unsubscribe();
    this.shareDBSocket?.close();
  }

  /**
   * This fuction is responsible for initialising the connection to sharedb backend
   */
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

  /**
   * This function is responsible for initialising the quill editor
   * @param modules
   */
  quillEditor(modules: Object) {
    // Create Quill Instance locally
    let quill: Quill;

    // Return the instance with modules
    return (quill = new Quill(`#${this.editorId}`, {
      theme: "snow",
      modules: modules,
      readOnly: this.readOnly,
      placeholder: $localize`:@@folioEditor.writeSomethingAwesome:Write something awesome...`,
    }));
  }

  /**
   * This function is responsible for creating the cursor
   * @param quill
   * @param user
   */
  createCursor(quill: Quill, user: any) {
    // Get the Cursor Module
    let cursorModule = quill.getModule("cursors");

    // Return Cursor Name
    return cursorModule.createCursor(user._id, user.full_name, "blue");
  }

  /**
   * This function is responsible for fetching the folio
   * @param folio
   */
  initializeFolio(folio: any, quill: Quill) {
    // Subscribe to the folio data and update the quill instance with the data
    folio.subscribe(async () => {
      if (!folio.type) {
        folio.create({ data: { comment: [], delta: [{ insert: "\n" }] } });
      }
      // update editor contents
      quill.setContents(folio.data.data.delta);
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
          var toSend = {
            p: ["data"],
            od: folio.data.data,
            oi: { comment: this.metaData, delta: quill.getContents().ops },
          };
          folio.submitOp(
            toSend,
            {
              source: quill,
            },
            (err: Error) => {
            }
          );
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

  handleFolio(folio: any, user: any, quill: Quill) {
    // local -> server
    quill.on("text-change", (delta: any, oldDelta, source) => {
      if (source == "user") {
        var formattingDelta = delta.reduce(function (check, op) {
          return op.insert || op.delete ? false : check;
        }, true);

        // If it's not a formatting-only delta, collapse local selection
        // delta.comments = this.metaData;
        delta.userId = user._id;
        folio.submitOp(
          delta,
          {
            source: this.quill,
          },
          (err: any) => {
          }
        );
      } else if (source == "api") {
      }
    });

    // server -> local
    folio.on("op", function (op, source) {
      if (source !== this.quill) {
        this.quill.updateContents(op);
      }
    });
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
      this.folio.submitOp(
        toSend,
        {
          source: this.quill,
        },
        (err: Error) => {
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
    this.folio.submitOp(
      toSend,
      {
        source: this.quill,
      },
      (err: Error) => {
      }
    );
  }

  //Highlights the text in given range
  highlight(range: any) {
    this.quill.setSelection(range.index, range.length);
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

  onCommentPress(event : KeyboardEvent) {
    if(this.mentionCommentUser) this.handleAt(event)
    else if (this.mentionCommentFile) this.handleHash(event)
    else if(event.key === '@') {
      this.mentionText = ''
      this.mentionCommentUser = true;
      this.handleAt(event);
    }
    else if(event.key === '#') {
      this.mentionText = ''
      this.mentionCommentFile = true;
      this.handleHash(event);
    }
  }

  async handleAt(event : KeyboardEvent) {
    event.key === "Backspace" ? this.mentionText = this.mentionText.slice(0 , -1) :
    (event.key.length == 1) ? this.mentionText = this.mentionText + event.key : null;
    if(this.mentionText.length < 1 || event.key === "Escape") {
      this.mentionCommentUser = false;
      return;
    }
    var members = await this.suggestMembers(this.groupId, this.mentionText.slice(1));
  }

  async handleHash(event : KeyboardEvent) {
    event.key === "Backspace" ? this.mentionText = this.mentionText.slice(0 , -1) :
    (event.key.length == 1) ? this.mentionText = this.mentionText + event.key : null;
    if(this.mentionText.length < 1 || event.key === "Escape") {
      this.mentionCommentFile = false;
      return;
    }
    var files = await this.suggestFiles(this.groupId, this.mentionText.slice(1));
  }
  /**
   * This function returns the mention module
   */
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

  /**
   * This function is responsible for fetching the group members list
   * @param groupId
   * @param searchTerm
   */
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

  /**
   * This function is responsible for fetching the files list
   * @param groupId
   * @param searchTerm
   */
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
