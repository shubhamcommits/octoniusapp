import { Injector, AfterViewInit, Component, ElementRef, OnInit, ViewChild, LOCALE_ID, Inject } from '@angular/core';
import { PublicFunctions } from "modules/public.functions";
import { ActivatedRoute } from "@angular/router";
import { SubSink } from "subsink";
import { FilesService } from "src/shared/services/files-service/files.service";
import { StorageService } from "src/shared/services/storage-service/storage.service";
import { FolioService } from 'src/shared/services/folio-service/folio.service';
import { environment } from "src/environments/environment";
import { UtilityService } from "src/shared/services/utility-service/utility.service";

// Highlight.js
import hljs from 'highlight.js';

// Highlight.js sublime css
import 'highlight.js/styles/monokai-sublime.css';

// Configure hljs for languages
hljs.configure({
  languages: ['javascript', 'ruby', 'bash', 'cpp', 'cs', 'css', 'dart', 'dockerfile', 'dos', 'excel', 'fortran', 'go', 'java', 'nginx', 'python', 'objectivec', 'yaml', 'yml']
});

// Quill Image Resize
import ImageResize from 'src/shared/utilities/quill-image-resize/ImageResize.js';

import QuillClipboard from 'src/app/common/shared/quill-modules/quill-clipboard';

// Image Drop Module
import ImageDrop from './quill-image-drop/quill.image-drop.js';

// Quill Image Compress
//import ImageCompress from 'quill-image-compress';

import ReconnectingWebSocket from "reconnecting-websocket";
import * as ShareDB from "sharedb/lib/client";

import { pdfExporter } from "quill-to-pdf";
import * as quillToWord from "quill-to-word";
import { saveAs } from "file-saver";

// Register the Types of the Sharedb
ShareDB.types.register(require('rich-text').type);

declare const Quill2: any;
declare const quillBetterTable: any;
Quill2.register({
  'modules/imageResize': ImageResize,
  'modules/better-table': quillBetterTable,
  'modules/imageDrop': ImageDrop
}, true);

Quill2.register('modules/clipboard', QuillClipboard, true);

@Component({
  selector: "app-folio-editor",
  templateUrl: "./folio-editor.component.html",
  styleUrls: ["./folio-editor.component.scss"],
})
export class FolioEditorComponent implements OnInit, AfterViewInit {

  @ViewChild('editable', { static: true })
  editRef!: ElementRef;

  @ViewChild('editable2', { static: true })
  editRef2!: ElementRef;

  // Quill instance variable
  quill: any;
  quill2: any;
  // Quill modules variable
  modules: any;

  //Comments to Display
  commentsToDisplay = [];

  //Comments MetaData
  commentsMetaData = [];

  // Table of content
  headingsMetaData = [];

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

  //resize percentafe
  percentage : string;

  //image alignment
  alignment : string;

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

  fileData: any;

  // Folio ID Variable
  folioId = this._ActivatedRoute.snapshot.paramMap.get("id");

  // GroupId variable
  groupId = this._ActivatedRoute.snapshot.queryParamMap.get("group");

  // Read Only State of the folio
  readOnly = true;

  // Range in the URL
  urlRange: any;

  workspaceData: any;

  // SubSink Variable
  subSink = new SubSink();

  // Uploads url for Files
  filesBaseUrl = environment.UTILITIES_FILES_UPLOADS;

  // Public functions class member
  publicFunctions = new PublicFunctions(this._Injector);

  constructor(
    @Inject(LOCALE_ID) public locale: string,
    private _Injector: Injector,
    private _ActivatedRoute: ActivatedRoute,
    private folioService: FolioService,
    private filesService: FilesService,
    private utilityService: UtilityService
  ) {
    this.folioService.follioSubject.subscribe(data => {
      if (data) {
        this.clearEditor();
        this.quill.clipboard.dangerouslyPasteHTML(data);
        this.saveQuillData();
      }
    });

    // Get the State of the ReadOnly
    this.readOnly = this._ActivatedRoute.snapshot.queryParamMap.get("readOnly") == "true" || false;

    const urlIndex = this._ActivatedRoute.snapshot.queryParamMap.get("index");
    const urlLength = this._ActivatedRoute.snapshot.queryParamMap.get("index");
    if (urlIndex && urlLength) {
      this.urlRange = {
        index: urlIndex,
        length: urlLength
      };
    }

    // Initialise the modules in constructor
    this.modules = {
      //imageModule: true,
      syntax: true,
      toolbar: {
        container :[
          [{ 'font': [] }, { 'size': [] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'color': [] }, { 'background': [] }],
          [{ 'script': 'super' }, { 'script': 'sub' }],
          [{ 'header': '1' }, { 'header': '2' }, /*'content',*/ 'blockquote', 'code-block'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
          ['direction', { 'align': [] }],
          ['link', 'image', 'video', 'formula'],
          ['comment'],['tables'],['clear'],['export-pdf'/*, 'export-doc'*/]
        ],
        handlers : {
          'comment': () => {
            this.openComment();
          },
          'tables': () => {
            this.openTableOptions();
          },
          'clear': () => {
            this.clearFolioContent();
          },
          // Generate the headings
          'header': (value) => {
            this.generateHeading(value);
          },
          // Show/Hide the table of Content
          /*
          TODO Commented until BRD pays
          'content': () => {
            this.displayHeadings();
          },
          */
          /*
          // Show/Hide the table of Content
          'list': (value) => {
            this.generateList(value);
          },
          */
         'export-pdf': () => {
            this.exportPdf();
          },
          /*
          'export-doc': () => {
            this.exportDoc();
          }
          */
        }},
      table: true,
      'better-table': {
        operationMenu: {
          items: {
            unmergeCells: {
              text: 'Another unmerge cells name'
            }
          },
          color: {
            colors: ['#808080', '#e7e6e6', 'red', '#b90000','green' , 'yellow', 'blue', 'white'],
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
      mention: this.metionModule(),
      // imageResize: this.quillImageResize(),
      imageResize: true,
      imageDrop: true,
    };
  }

  async ngOnInit() {
    if (!this.readOnly) {
      this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    }
    this.folio = this.initializeConnection();
    this.fileData = await this.getFile(this.folioId, this.readOnly);
    // TODO - Remove the following line when BRD pays
    this.fileData.show_headings = false;
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

    this.initEditor();
    this.initializeFolio(this.folio, this.quill);
  }

  ngOnDestroy() {
    this.subSink.unsubscribe();
    this.shareDBSocket?.close();
  }

  initEditor(): void {
    this.quill = new Quill2(this.editRef.nativeElement, {
      theme: this.readOnly ? 'bubble' : 'snow',
      modules: this.modules,
      readOnly: this.readOnly
    });

    this.quill2 = new Quill2(this.editRef2.nativeElement,{
      theme: 'snow',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline']
        ],
        mention : this.metionModule()
      }
    });

    document.querySelector(".ql-comment").innerHTML = '<span class="material-icons-outlined" style="font-size: 20px;">comment</span>';
    document.querySelector(".ql-clear").innerHTML = '<span class="material-icons-outlined" style="font-size: 20px;">auto_fix_high</span>';
    document.querySelector('.ql-tables').innerHTML = '<span class="material-icons-outlined" style="font-size: 20px;">table_chart</span>';
    // TODO Commented until BRD pays
    // document.querySelector('.ql-content').innerHTML = '<span class="material-icons-outlined" style="font-size: 20px;">list_alt</span>';
    document.querySelector(".ql-export-pdf").innerHTML = '<span class="material-icons-outlined" style="font-size: 20px;">picture_as_pdf</span>';
    // document.querySelector('.ql-export-doc').innerHTML = '<span class="material-icons-outlined" style="font-size: 20px;">file_download</span>';
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
      // Convert existing rich text documents to json0
      this.richtextToJson0(folio, quill);
      if (!folio.type) {
        folio.create({ data: { comment: [], delta: [{ insert: "\n" }] } });
      }

      // update editors contents
      quill.setContents(folio?.data?.data?.delta);
      // quill.setContents(folio?.data);
      this.quill2.setContents([{ insert: "\n" }]);

      this.commentsMetaData = folio?.data?.data?.comment;
      this.commentsMetaData = await this.sortComments();

      this.headingsMetaData = folio?.data?.data?.headings;
      this.headingsMetaData = await this.sortHeaders();

      // local -> server
      quill.on("text-change", (delta, oldDelta, source) => {
        if (delta.ops.length > 1) {
          delta.ops.forEach(op => {
            if (op.insert) {
              let insertMap = JSON.parse(JSON.stringify(op.insert));
              // Add mentions
              if (insertMap.mention && insertMap.mention.denotationChar === "@") {
                this.filesService.newFolioMention(insertMap.mention, this.folioId, this.userData._id)
                  .then((res) => res.subscribe());
              }
            }
          });
        }

        if (source == "user") {
          this.saveQuillData();
        }
      });

      quill.on("selection-change",(range, oldRange, source) => {
        if(range != null) {
          this.commentsToDisplay = [];
          this.mapComments(range.index, range.length);
        }
      });

      // server -> local
      folio.on("op", (op, source) => {
        if (source === quill) return;
        // quill.updateContents(op);
        /**
         * Disabling update contents and
         * using setcontents because other plugins do not have
         * proper support for update contents
         */
        quill.setContents(op[0].oi.delta);
        this.commentsMetaData = op[0].oi.comment;
        this.commentsMetaData = this.sortComments();

        this.headingsMetaData = op[0].oi.headings;
        this.headingsMetaData = this.sortHeaders();
      });

      if (this.urlRange) {
        this.highlight(this.urlRange);
      }
    });
  }

  richtextToJson0(folio: any, quill: any) {
    if (folio?.type?.name === 'rich-text') {
      quill.setContents(folio?.data);
      folio.del();
      folio.create({ data: { comment: [], delta: [{ insert: "\n" }] } });
      this.saveQuillData();
    }
  }

  //To get comments on selection
  mapComments(index : number, length : number) {
    if (this.commentsMetaData) {
      var selectedIndexes = this.generateIndexes(index, length);
      this.commentsMetaData.forEach((value, index) => {
        var valueIndexes = this.generateIndexes(value.range.index, value.range.length);
        var found = false
        valueIndexes.forEach((val) => {
          if (selectedIndexes.includes(val)) {
            found = true;
          }
        })
        if (found) {
          if (!this.commentsToDisplay) {
            this.commentsToDisplay = [];
          }
          this.commentsToDisplay.push(index);
        }
      });
    }
  }

  generateIndexes(index : number, length : number) {
    var arr = [];
    for(var i = index; i <= index+length; i++) {
      arr.push(i);
    }
    return arr;
  }

   // Delete Comment
   deleteComment(index: any) {
    this.utilityService.getConfirmDialogAlert($localize`:@@folioEditor.areYouSure:Are you sure?`, $localize`:@@folioEditor.commentCompletelyRemoved:By doing this, the comment be completely removed!`)
      .then((res) => {
        if (res.value) {
          this.utilityService.asyncNotification($localize`:@@folioEditor.pleaseWaitDeletingComment:Please wait we are deleting the comment...`, new Promise(async (resolve, reject) => {
            try {
              if (this.commentsMetaData) {
                var commentData = this.commentsMetaData[index];
                this.quill.formatText(commentData.range.index, commentData.range.length, {
                  background: "white",
                });

                this.commentsMetaData.splice(index, 1);
                this.commentsMetaData = await this.sortComments();
                this.saveQuillData();
              }
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@folioEditor.commentDeleted:Comment deleted!`));
            } catch (err) {
              reject(this.utilityService.rejectAsyncPromise($localize`:@@folioEditor.unableDeleteComment:Unable to delete the comment, please try again!`));
            }
          }));
        }
      });
  }

  saveQuillData() {
    var toSend = {
      p: ["data"],
      // In json0 the required data is inside data.data
      od: this.folio.data.data,
      oi: { comment: this.commentsMetaData, delta: this.quill.getContents().ops, headings: this.headingsMetaData },
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
  async submitComment() {
    this.enteredComment = this.quill2.root.innerHTML;

    if (this.selectedText == null || this.selectedText == "") {
      await this.utilityService.getConfirmDialogAlert($localize`:@@folioEditor.areYouSure:Are you sure?`, $localize`:@@folioEditor.noContentSelected:No content is selected`).then(res => {
        if (res.value) {
          this.saveComment();
        }
      });
    } else if (this.enteredComment == null || this.enteredComment == "" || this.enteredComment == "<p><br></p>") {
      await this.utilityService.getConfirmDialogAlert($localize`:@@folioEditor.areYouSure:Are you sure?`, $localize`:@@folioEditor.pleaseEnterComment:Please enter the comment`).then(res => {
        if (res.value) {
          this.saveComment();
        }
      });
    } else {
      this.saveComment();
    }
  }

  async saveComment() {
    var userName = this.userData.first_name + ' ' + this.userData.last_name;
    this.quill2.getContents().ops.map((value) => {
      if (value.insert.mention) {
        var mentionMap = value.insert;
        if (mentionMap.mention && mentionMap.mention.denotationChar === "@") {
          this.filesService.newFolioMention(mentionMap.mention, this.folioId, this.userData._id).then((res) => res.subscribe());
        }
      }
    });

    if (!this.commentsMetaData) {
      this.commentsMetaData = [];
    }
    this.commentsMetaData.push({ range: this.range, comment: this.enteredComment, user_name : userName, profile_pic : this.userData.profile_pic });
    this.commentsMetaData = await this.sortComments();
    this.quill.formatText(this.range.index, this.range.length, {
      background: "#fff72b",
    });

    this.saveQuillData();

    this.quill2.deleteText(0, this.quill2.getLength());
    this.commentBool = false;
    this.selectedText = null;
    this.enteredComment = null;
  }

  //Closes the comment dialog box
  closeComment() {
    this.quill2.deleteText(0, this.quill2.getLength());
    this.commentBool = false;
    this.selectedText = null;
    this.enteredComment = null;
  }

  clearFolioContent() {
    this.utilityService.getConfirmDialogAlert($localize`:@@folioEditor.areYouSure:Are you sure?`, $localize`:@@folioEditor.contentCompletelyRemoved:By doing this, the content of the folio will be completely removed!`)
      .then((res) => {
        if (res.value) {
          this.utilityService.asyncNotification($localize`:@@folioEditor.pleaseWaitDeletingContent:Please wait we are deleting the content...`, new Promise(async (resolve, reject) => {
            try {
              this.clearEditor();
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@folioEditor.contentDeleted:Content of the folio deleted!`));
            } catch (err) {
              reject(this.utilityService.rejectAsyncPromise($localize`:@@folioEditor.unableDeleteContent:Unable to delete the content of the folio, please try again!`));
            }
          }));
        }
      });
  }

  //Clears the entire editor
  clearEditor() {
    if (!this.quill) {
      this.initEditor();
    }
    this.quill.deleteText(0, this.quill.getLength());
    this.commentsMetaData = [];
    this.headingsMetaData = [];
    this.saveQuillData();
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
    this.tableShow = false;
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
          let matches = [];
          for (let i = 0; i < values.length; i++) {
            if (~values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())) {
              matches.push(values[i]);
            }
          }
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
          : (file.type == "flamingo")
            ? `<a href="/document/flamingo/${file._id}?group=${file._group._id}" style="color: inherit" target="_blank">${file.original_name}</a>`
            : `<a href="${this.filesBaseUrl}/${file.modified_name}?authToken=Bearer ${storageService.getLocalData("authToken")["token"]}" style="color: inherit" target="_blank">${file.original_name}</a>`,
    }));

    let googleFilesList: any = [];

    // Fetch Access Token
    if (storageService.existData('googleUser') && this.workspaceData?.integrations?.is_google_connected) {

      // Fetch the access token from the storage
      let accessToken = storageService.getLocalData('googleUser')['accessToken']

      // Get Google file list
      googleFilesList = await this.publicFunctions.searchGoogleFiles(searchTerm, accessToken) || []

      // Google File List
      if (googleFilesList.length > 0)
        googleFilesList = googleFilesList.map((file: any) => ({
          id: '5b9649d1f5acc923a497d1da',
          value: '<a style="color:inherit;" target="_blank" href="' + file.embedLink + '"' + '>' + file.title + '</a>'
        }))
    }

    // Return the Array without duplicates
    return Array.from(new Set([...filesList, ...googleFilesList]));
  }

  /**
   * This function is returns the configuration for quill image and compress it if required
   */
  quillImageCompress() {
    return {
      quality: 0.9,
      maxWidth: 1000,
      maxHeight: 1000,
      imageType: 'image/jpeg'
    }
  }

  /**
   * This function is returns the configuration for quill image resize module
   */
/*
  quillImageResize() {
    return {
      displaySize: true,
      handleStyles: {
        backgroundColor: 'black',
        border: 'none',
        color: 'white',
        zIndex: '1000'
      },
      toolbarStyles: {
        backgroundColor: 'black',
        border: 'none',
        color: 'white',
        zIndex: '1000'
      },
      displayStyles: {
        zIndex: '1000'
      }
    }
  }
*/
  sortComments() {
    return (this.commentsMetaData) ? this.commentsMetaData.sort((c1, c2) => (c1.range.index > c2.range.index) ? 1 : -1) : [];
  }

  sortHeaders() {
    return (this.headingsMetaData) ? this.headingsMetaData.sort((h1, h2) => (h1.range.index > h2.range.index) ? 1 : -1) : [];
  }

  /**
   * Creates a heading to be added to the table of content
   */
  generateHeading(value: any) {
    this.range = this.quill.getSelection(true);
    let [leaf, offsetLeaf] = this.quill.getLeaf(this.range.index);

    const headingIndex = this.headingsMetaData.findIndex(heading => {
      let [line1, offset1] = this.quill.getLine(heading.range.index);
      let [line2, offset2] = this.quill.getLine(this.range.index);
      return line1 == line2;
    });

    this.quill.formatLine(this.range.index, this.range.length, 'header', value);
    const elementType = leaf?.parent?.domNode?.localName;
    if (headingIndex >= 0) {
      let header = this.headingsMetaData[headingIndex];
      if (!value || header.headingLevel == value) {
        this.headingsMetaData.splice(headingIndex, 1);
      } else {
        header.range = this.range,
        header.headingLevel = value;
        this.headingsMetaData[headingIndex] = header;
      }
    } else if (elementType && elementType.charAt(0) && elementType.charAt(0).toLowerCase() == 'h') {
      this.headingsMetaData.push({
        text: leaf.text,
        range: this.range,
        headingLevel: value
      });
    }

    this.sortHeaders();
    this.saveQuillData();
  }

  createLink(range: any) {
    // Create Selection Box
    let selBox = document.createElement('textarea');

    // Set the CSS Properties
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';

    let url = environment.clientUrl;
    if (environment.production) {
      url += '/' + this.locale;
    }
    url += '/document/' + this.folioId + '?group=' + this.groupId + '&index=' + range.index +'&length=' + range.length +'&readOnly=true';

    selBox.value = url;
    // Append the element to the DOM
    document.body.appendChild(selBox);

    // Set the focus and Child
    selBox.focus();
    selBox.select();

    // Execute Copy Command
    document.execCommand('copy');

    // Once Copied remove the child from the dom
    document.body.removeChild(selBox);

    // Show Confirmed notification
    this.utilityService.simpleNotification($localize`:@@folioEditor.copiedToClipboard:Copied to Clipboard!`);
  }

  displayHeadings() {
    this.folioService.displayHeadings(this.fileData?._id, !this.fileData?.show_headings).then(res => {
      this.fileData.show_headings = !this.fileData?.show_headings;
    }).catch (err => {
      this.utilityService.errorNotification($localize`:@@folioEditor.unableUpdateFolio:Unable to update the folio, please try again!`);
    });
  }

  /**
   * Creates a heading to be added to the table of content
   */
  /*
   generateList(value: any) {
    this.range = this.quill.getSelection(true);
console.log(value);
    this.quill.formatLine(this.range.index, this.range.length, 'list', value);

    this.saveQuillData();
  }
  */

  /**
   * This function is responsible for fetching a file's details
   * @param fileId
   */
  public async getFile(fileId: any, readOnly:boolean) {
    return new Promise((resolve) => {
      // Fetch the file details
      this.filesService.getOne(fileId, readOnly)
        .then((res) => {
          resolve(res['file'])
        })
        .catch(() => {
          resolve({})
        });
    });
  }

  /*
  Test code to generate a table of content automatically WIP
  generateTableOfContent() {
    this.headingsMetaData = [];

    let root: any = document.createElement('div');
    root.innerHTML = this.quill.root.innerHTML;

    // Search for H1 elementes
    const h1s = root.querySelectorAll('h1');
    h1s.forEach(h1 => {
      const h1String = '<h1>' + h1.innerText +'</h1>';
      const indices = this.getIndicesOf(h1String, this.quill.root.innerHTML, false);
      indices.forEach(index => {
        let header = {
          text: h1.innerText,
          range: {index: index, length: h1String.length},
          headingLevel: 1
        };

        const headingIndex = this.headingsMetaData.findIndex(heading => {
          let [line1, offset1] = this.quill.getLine(heading.range.index);
          let [line2, offset2] = this.quill.getLine(header.range.index);
          return line1 == line2;
        });

        if (headingIndex < 0) {
          this.headingsMetaData.push(header);
        } else {
          this.headingsMetaData[headingIndex] = header;
        }
      });
    });

    // Search for H2 elementes
    const h2s = root.querySelectorAll('h2');
    h2s.forEach(h2 => {
      const h2String = '<h2>' + h2.innerText +'</h2>';
      const indices = this.getIndicesOf(h2String, this.quill.root.innerHTML, false);
      indices.forEach(index => {
        let header = {
          text: h2.innerText,
          range: {index: index, length: h2String.length},
          headingLevel: 2
        };

        const headingIndex = this.headingsMetaData.findIndex(heading => {
          let [line1, offset1] = this.quill.getLine(heading.range.index);
          let [line2, offset2] = this.quill.getLine(header.range.index);
          return line1 == line2;
        });

        if (headingIndex < 0) {
          this.headingsMetaData.push(header);
        } else {
          this.headingsMetaData[headingIndex] = header;
        }
      });
    });

    this.sortHeaders();
    this.saveQuillData();
  }

  getIndicesOf(searchStr, str, caseSensitive) {
    var searchStrLen = searchStr.length;
    if (searchStrLen == 0) {
        return [];
    }
    var startIndex = 0, index, indices = [];
    if (!caseSensitive) {
        str = str.toLowerCase();
        searchStr = searchStr.toLowerCase();
    }
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
    }
    return indices;
  }
  */
  async exportPdf() {
    // we retrieve the delta object from the Quill instance
    // the delta is the raw content of your Quill editor
    const delta = this.quill.getContents();

    // we pass the delta object to the generatePdf function of the pdfExporter
    // be sure to AWAIT the result, because it returns a Promise
    // it will resolve to a Blob of the PDF document
    const blob = await pdfExporter.generatePdf(delta);

    // we use saveAs from the file-saver package to download the blob
    saveAs(blob as Blob, this.fileData?.original_name + ".pdf");
  }

  async exportDoc() {
    const delta = this.quill.getContents();
    const blob = await quillToWord.generateWord(delta, { exportAs: "blob" });
    saveAs(blob, this.fileData?.original_name + ".docx");
  }
}
