import { Injector, Input, AfterViewInit, Component, ElementRef, ViewChild, LOCALE_ID, Inject } from '@angular/core';
import { PublicFunctions } from "modules/public.functions";
import { ActivatedRoute } from "@angular/router";
import { SubSink } from "subsink";
import { FilesService } from "src/shared/services/files-service/files.service";
import { FolioService } from 'src/shared/services/folio-service/folio.service';
import { environment } from "src/environments/environment";
import { UtilityService } from "src/shared/services/utility-service/utility.service";

// Highlight.js
import hljs from 'highlight.js';

// Highlight.js sublime css
//import 'highlight.js/styles/monokai-sublime.css';

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
export class FolioEditorComponent implements AfterViewInit {

  @ViewChild('editable', { static: true }) editRef!: ElementRef;

  @ViewChild('editable2', { static: true }) editRef2!: ElementRef;

  @Input() mentionAll = true;

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
  //Comment modal type. this will be use to re-use the modal for comments and headings
  commentType: string = 'comment';

  // Table modal boolean
  tableShow: boolean = false;

  //resize percentafe
  percentage : string;

  //image alignment
  alignment : string;

  // User Data Variable
  userData: any;

  groupData: any;

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

  // Read Only State of the folio
  readOnly = true;

  // Range in the URL
  urlRange: any;

  workspaceData: any;

  // SubSink Variable
  subSink = new SubSink();

  // Public functions class member
  publicFunctions = new PublicFunctions(this._Injector);

  findAFileToTag = $localize`:@@folioEditor.findAFileToTag:find a file to tag`;
  findAPostToTag = $localize`:@@folioEditor.findAPostToTag:find a post to tag`;
  findACollectionToTag = $localize`:@@folioEditor.findACollectionToTag:find a collection to tag`;
  findAPageFromACollectionToTag = $localize`:@@folioEditor.findAPageFromACollectionToTag:find a page from a collection to tag`;

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
          [{ 'header': '1' }, { 'header': '2' }, 'outline', 'content', 'blockquote', 'code-block'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
          ['direction', { 'align': [] }],
          ['link', 'image', 'video', 'formula'],
          ['comment', 'comment_display'],['tables'],['clear'],['export-pdf'/*, 'export-doc'*/]
        ],
        handlers : {
          'comment': () => {
            this.openComment();
          },
          // Show/Hide the table of Comments
          'comment_display': () => {
            this.displayComments();
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
          // Generate the headings
          'outline': (value) => {
            this.generateHeadingOutline();
          },
          // Show/Hide the table of Content
          'content': () => {
            this.displayHeadings();
          },
          /*
          // Automatic generate the table of Content
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

  async ngAfterViewInit() {

    if (!this.readOnly) {
      this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    }
    this.folio = this.initializeConnection();
    this.fileData = await this.publicFunctions.getFile(this.folioId, this.readOnly);

    // Fetch User Data
    if (!this.readOnly) {
      this.userData = await this.publicFunctions.getCurrentUser();

      /*
      // check if the user is part of the group of the folio
      const groupIndex = await this.userData?._groups?.findIndex((group) => {
        return (group._id || group) == this.groupId;
      });

      let groupData: any = this.userData?._groups[groupIndex];
      */
      this.groupData = await this.publicFunctions.getCurrentGroupDetails();

      // check if the user is part of the group of the folio
      const groupIndex = await this.userData?._groups?.findIndex((group) => {
        return (group._id || group) == this.groupData?._id;
      });

      const isAdmin = this.isAdminUser(this.groupData);
      let canEdit = await this.utilityService.canUserDoFileAction(this.fileData, this.groupData, this.userData, 'edit') && (!this.groupData?.files_for_admins || isAdmin);

      this.readOnly = this.readOnly || (groupIndex < 0 && !isAdmin) || !canEdit;
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
    document.querySelector(".ql-comment_display").innerHTML = '<span class="material-icons-outlined" style="font-size: 20px;">forum</span>';
    document.querySelector(".ql-clear").innerHTML = '<span class="material-icons-outlined" style="font-size: 20px;">auto_fix_high</span>';
    document.querySelector('.ql-outline').innerHTML = '<span class="material-icons-outlined" style="font-size: 20px;">list</span>';
    document.querySelector('.ql-tables').innerHTML = '<span class="material-icons-outlined" style="font-size: 20px;">table_chart</span>';
    document.querySelector('.ql-content').innerHTML = '<span class="material-icons-outlined" style="font-size: 20px;">list_alt</span>';
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
    this.commentType = 'comment';
    this.range = this.quill.getSelection(true);
    this.selectedText = this.quill.getText(this.range.index, this.range.length);
  }

  generateHeadingOutline() {
    this.commentBool = true;
    this.commentType = 'heading';
    this.range = this.quill.getSelection(true);
    this.selectedText = this.quill.getText(this.range.index, this.range.length);
  }

  //Validates comment content and adds the comment
  async submitComment() {

    this.enteredComment = this.quill2.root.innerHTML;

    if (this.selectedText == null || this.selectedText == "") {
      await this.utilityService.getConfirmDialogAlert($localize`:@@folioEditor.areYouSure:Are you sure?`, $localize`:@@folioEditor.noContentSelected:No content is selected`).then(res => {
        if (res.value) {
          if (this.commentType == 'comment') {
            this.saveComment();
          } else if (this.commentType == 'heading') {
            this.saveHeading();
          }
        }
      });
    } else if (this.enteredComment == null || this.enteredComment == "" || this.enteredComment == "<p><br></p>") {
      await this.utilityService.getConfirmDialogAlert($localize`:@@folioEditor.areYouSure:Are you sure?`, $localize`:@@folioEditor.pleaseEnterComment:Please enter the comment`).then(res => {
        if (res.value) {
          if (this.commentType == 'comment') {
            this.saveComment();
          } else if (this.commentType == 'heading') {
            this.saveHeading();
          }
        }
      });
    } else {
      if (this.commentType == 'comment') {
        this.saveComment();
      } else if (this.commentType == 'heading') {
        this.saveHeading();
      }
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
    this.commentsMetaData.push({ range: this.range, comment: this.enteredComment, userData: this.userData, userId: this.userData._id, user_name : userName, profile_pic : this.userData.profile_pic });
    this.commentsMetaData = await this.sortComments();
    this.quill.formatText(this.range.index, this.range.length, {
      background: "#fff72b",
    });

    this.saveQuillData();

    this.closeComment();
  }

  saveHeading() {
    if (!this.fileData?.show_headings) {
      this.displayHeadings();
    }

    const headingIndex = this.headingsMetaData.findIndex(heading => {
      let [line1, offset1] = this.quill.getLine(heading.range.index);
      let [line2, offset2] = this.quill.getLine(this.range.index);
      return line1 == line2;
    });

    if (headingIndex >= 0) {
      let header = this.headingsMetaData[headingIndex];
      if (header.headingLevel == 3) {
        this.headingsMetaData.splice(headingIndex, 1);
      } else {
        header.text = this.enteredComment,
        header.range = this.range,
        header.headingLevel = 3;
        this.headingsMetaData[headingIndex] = header;
      }
      this.quill.formatLine(this.range.index, this.range.length, 'header', 0);
    } else {
      this.headingsMetaData.push({
        text: this.enteredComment,
        range: this.range,
        headingLevel: 3
      });
    }

    this.sortHeaders();
    this.saveQuillData();
    this.closeComment();
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
    // Available commands - the order needs to match the index of cmdSuggestions
    enum Command { file, post, col, colpage }

    return {
      allowedChars: /^[A-Za-z\sÅÄÖåäö0123456789]*$/,
      mentionDenotationChars: ["@", "#"],
      selectKeys: ['Enter'], 
      //This function is called when a mention has been selected
      onSelect: (item, insertItem) => {
        // If the item value is a span, User has selected a command
        if (item.value.split(' ')[0] === '<span') {
          let selection = this.quill.getSelection(true)
          let index = selection.index;
          
          // Insert the text for the command into the quill
          if (item.index == Command.file) {
            this.quill.insertText(index, 'file')
          } else if (item.index == Command.post) {
            this.quill.insertText(index, 'post')
          } else if (item.index == Command.col) {
            this.quill.insertText(index, 'col')
          } else if (item.index == Command.colpage) {
            this.quill.insertText(index, 'colpage')
          }
          
          // Set the cursor to where the text has been inserted
          index += Command[item.index].length
          this.quill.setSelection(index)
          this.quill.focus();

        // If it is not a command, insert the selected mention item
        } else {
          insertItem(item)
        }
      },
      source: async (searchTerm, renderList, mentionChar) => {

        // Value of the mention list
        let values: any;
        let searchVal: any;

        // If User types "@" then trigger the list for user mentioning
        if (mentionChar === "@") {
          // Initialise values with list of members
          values = await this.publicFunctions.suggestMembers(searchTerm, this.groupData?._id, this.workspaceData);

          // Adding All Object to mention all the members
          if (this.mentionAll) {
            values.unshift({
              id: 'all',
              value: 'all'
            });
          }

        // If User types "#" then trigger the list for files mentioning
        } else if (mentionChar === "#") {
          // Initialise values with list of collection pages
          if (searchTerm.slice(0, 8) === 'colpage ') {
            searchVal = searchTerm.split(' ')[1];
            values = await this.publicFunctions.suggestCollectionPages(searchVal, this.groupData?._id, this.workspaceData);  

          // Initialise values with list of collections
          } else if (searchTerm.slice(0, 4) === 'col ') {
            searchVal = searchTerm.replace('col ', '');
            values = await this.publicFunctions.suggestCollection(this.groupData?._id, searchVal);

          // Initialise values with list of files
          } else if (searchTerm.slice(0, 5) === 'file ') {
            searchVal = searchTerm.replace('file ', '');
            values = await this.publicFunctions.suggestFiles(searchVal, this.groupData?._id, this.workspaceData);
  
          // Initialise values with list of posts
          } else if (searchTerm.slice(0, 5) === 'post ') {
            searchVal = searchTerm.replace('post ', '');
            values = await this.publicFunctions.suggestPosts(searchVal, this.groupData?._id);
            
            // If none of the filters are used, initialise values with all entities
          } else if (searchTerm.length === 0) {
            
          /**
           * The following code triggers a list to display all the assets when no filter has been provided
           *
            searchVal = searchTerm;
            const collections = await this.publicFunctions.suggestCollection(this.groupData?._id, searchVal);
            const collectionPages = await this.publicFunctions.suggestCollectionPages(searchVal, this.groupData?._id, this.workspaceData);
            const files = await this.publicFunctions.suggestFiles(searchTerm, this.groupData?._id, this.workspaceData);
            const posts = await this.publicFunctions.suggestPosts(searchVal, this.groupData?._id);
            values = [...collections, ...collectionPages, ...files, ...posts]
          */
            
          // This is the list of command suggestions that displays when User types "#"
            let cmdSuggestions = [
              { value: '<span >#file <em>filename</em> <p style="color: #9D9D9D" i18n="@@folioEditor.findAFileToTag"> find a file to tag</p> </span>' },
              { value: '<span >#post <em>posttitle</em> <p style="color: #9D9D9D" i18n="@@folioEditor.findAPostToTag"> find a post to tag </p> </span>' },
              { value: '<span >#col <em>collectionname</em> <p style="color: #9D9D9D" i18n="@@folioEditor.findACollectionToTag"> find a collection to tag </p> </span>' },
              { value: '<span >#colpage <em>collectionpage</em> <p style="color: #9D9D9D" i18n="@@folioEditor.findAPageFromACollectionToTag"> find a page from a collection to tag </p> </span>' },                
            ]
            values = cmdSuggestions  
          }
      }
      
      // If searchVal is undefined, then display the list of command suggestions
          if (searchVal === undefined) {
          renderList(values);
        } else {
          const matches = [];
          for (let i = 0; i < values?.length; i++) {
            if (values[i] && values[i].value && ~values[i].value.toLowerCase().indexOf(searchVal?.toLowerCase())) {
              matches.push(values[i]);
            }
          }
          renderList(matches, searchVal);
        }
      }
    }
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

    if (!this.fileData?.show_headings) {
      this.displayHeadings();
    }

    this.range = this.quill.getSelection(true);
    let [leaf, offsetLeaf] = this.quill.getLeaf(this.range.index);

    const headingIndex = this.headingsMetaData.findIndex(heading => {
      let [line1, offset1] = this.quill.getLine(heading.range.index);
      let [line2, offset2] = this.quill.getLine(this.range.index);
      return line1 == line2;
    });

    this.quill.formatLine(this.range.index, this.range.length, 'header', value);

    if (headingIndex >= 0) {
      let header = this.headingsMetaData[headingIndex];
      if (!value || header.headingLevel == value) {
        this.headingsMetaData.splice(headingIndex, 1);
      } else {
        header.text = leaf.text,
        header.range = this.range,
        header.headingLevel = value;
        this.headingsMetaData[headingIndex] = header;
      }
    } else {
      this.headingsMetaData.push({
        text: leaf.text,
        range: this.range,
        headingLevel: value
      });
    }

    this.sortHeaders();
    this.saveQuillData();
  }

  deleteHeading(heading: any) {
    const headingIndex = this.headingsMetaData.findIndex(h => {
      let [line1, offset1] = this.quill.getLine(h.range.index);
      let [line2, offset2] = this.quill.getLine(heading.range.index);
      return line1 == line2;
    });

    if ((heading.headingLevel == 1 || heading.headingLevel == 2) && headingIndex >= 0) {
      this.quill.formatLine(heading.range.index, heading.range.length, 'header', false);
    }

    if (headingIndex >= 0) {
      this.headingsMetaData.splice(headingIndex, 1);
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
    url += '/document/' + this.folioId + '?index=' + range.index +'&length=' + range.length +'&readOnly=true';

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

  displayComments() {
    this.folioService.displayComments(this.fileData?._id, !this.fileData?.show_comments).then(res => {
        this.fileData.show_comments = !this.fileData?.show_comments;
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

  isAdminUser(groupData: any) {
    const index = (groupData && groupData._admins) ? groupData._admins.findIndex((admin: any) => admin._id === this.userData._id) : -1;
    return index >= 0 || this.userData.role == 'owner';
  }
}
