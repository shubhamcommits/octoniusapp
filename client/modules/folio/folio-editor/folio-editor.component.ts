import { Injector, AfterViewInit, Component, ElementRef, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { PublicFunctions } from "modules/public.functions";
import { ActivatedRoute } from "@angular/router";
import { SubSink } from "subsink";
import { FilesService } from "src/shared/services/files-service/files.service";
import { StorageService } from "src/shared/services/storage-service/storage.service";
import { FolioService } from 'src/shared/services/folio-service/folio.service';
import { environment } from "src/environments/environment";
import { UtilityService } from "src/shared/services/utility-service/utility.service";

// Quill Image Resize
//import ImageResize from './quill-image-resize/quill.image-resize.js';

import BlotFormatter, { DeleteAction, ResizeAction, ImageSpec } from "quill-blot-formatter";
//import { Action, Aligner, DefaultAligner, DefaultToolbar, Toolbar, Alignment, AlignOptions } from 'quill-blot-formatter';

// Image Drop Module
import ImageDrop from './quill-image-drop/quill.image-drop.js';

// Quill Image Compress
//import ImageCompress from 'quill-image-compress';

import ReconnectingWebSocket from "reconnecting-websocket";
import * as ShareDB from "sharedb/lib/client";


// Register the Types of the Sharedb
ShareDB.types.register(require('rich-text').type);

declare const Quill2: any;
declare const quillBetterTable: any;
Quill2.register({
  //'modules/imageResize': ImageResize,
  'modules/blotFormatter': BlotFormatter,
  'modules/better-table': quillBetterTable,
  'modules/imageDrop': ImageDrop,
  //'modules/imageCompress': ImageCompress,
  //'modules/table': quillTable.TableModule,
}, true);

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

  constructor(
    private _Injector: Injector,
    private _ActivatedRoute: ActivatedRoute,
    private follioService: FolioService,
    private utilityService: UtilityService
  ) {
    // Get the State of the ReadOnly
    this.follioService.follioSubject.subscribe(data => {
      if (data) {
        this.clearEditor();
        this.quill.clipboard.dangerouslyPasteHTML(data);
        this.saveQuillData();
      }
    });

    this.readOnly = this._ActivatedRoute.snapshot.queryParamMap.get("readOnly") == "true" || false;

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
          [{ 'header': '1' }, { 'header': '2' }, 'blockquote', 'code-block'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
          ['direction', { 'align': [] }],
          ['link', 'image', 'video', 'formula'],
          ['clean'], ['comment'],['tables'],['clear']
        ], handlers : {
          /*
          'image' : () => {
            const imgMod = this.quill.getModule('imageModule');
            imgMod.insertImage(this.quill);
          },
          */
          'comment': () => {
            this.openComment();
          },
          'tables': () => {
            this.openTableOptions();
          },
          'clear': () => {
            this.clearFolioContent();
          }
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
        //imageResize: this.quillImageResize(),
        imageDrop: true,
        //imageCompress: this.quillImageCompress(),
        blotFormatter: this.quillBlotFormatter()
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

    this.initEditor();
    this.initializeFolio(this.folio, this.quill);

    document.querySelector(".ql-comment").innerHTML = '<span class="material-icons-outlined" style="font-size: 20px;">comment</span>';
    document.querySelector(".ql-clear").innerHTML = '<span class="material-icons-outlined" style="font-size: 20px;">auto_fix_high</span>';
    document.querySelector('.ql-tables').innerHTML = '<span class="material-icons-outlined" style="font-size: 20px;">table_chart</span>';
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
      // Convert existing rich text documents to json0
      this.richtextToJson0(folio, quill);
      if (!folio.type) {
        folio.create({ data: { comment: [], delta: [{ insert: "\n" }] } });
        // folio.create([{
        //   insert: '\n'
        // }], 'rich-text');
      }

      // update editors contents
      quill.setContents(folio?.data?.data?.delta);
      // quill.setContents(folio?.data);
      this.quill2.setContents([{ insert: "\n" }]);

      this.metaData = folio?.data?.data?.comment;
      this.metaData = await this.sortComments();

      // local -> server
      quill.on("text-change", (delta, oldDelta, source) => {
        if (delta.ops.length > 1) {
          delta.ops.forEach(op => {
            if (op.insert) {
              let insertMap = JSON.parse(JSON.stringify(op.insert));

              // Add mentions
              if (insertMap.mention && insertMap.mention.denotationChar === "@") {
                let filesService = this._Injector.get(FilesService);
                filesService.newFolioMention(insertMap.mention, this.folioId, this.userData._id)
                  .then((res) => res.subscribe());
              }

              // Harcode save resize image
              /*
              if (insertMap.image) {
                const index = this.folio.data.data.delta.findIndex(op => op.insert && op.insert.image && op.insert.image.id == insertMap.image.id);
                if (index >= 0) {
                  this.folio.data.data.delta[index].insert.image = insertMap.image;
                }
              }
              */
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
        this.metaData = op[0].oi.comment;
        this.metaData = this.sortComments();
      });
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
    if (this.metaData) {
      var selectedIndexes = this.generateIndexes(index, length);
      this.metaData.forEach((value, index) => {
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
              if (this.metaData) {
                var commentData = this.metaData[index];
                this.quill.formatText(commentData.range.index, commentData.range.length, {
                  background: "white",
                });

                this.metaData.splice(index, 1);
                this.metaData = await this.sortComments();
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
          let filesService = this._Injector.get(FilesService);
          filesService.newFolioMention(mentionMap.mention, this.folioId, this.userData._id).then((res) => res.subscribe());
        }
      }
    });

    if (!this.metaData) {
      this.metaData = [];
    }
    this.metaData.push({ range: this.range, comment: this.enteredComment, user_name : userName, profile_pic : this.userData.profile_pic });
    this.metaData = await this.sortComments();
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

    // Return the Array without duplicates
    return Array.from(new Set(filesList));
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

  quillBlotFormatter() {
    return {
      specs: [CustomImageSpec],

    };
  }

  sortComments() {
    return (this.metaData) ? this.metaData.sort((c1, c2) => (c1.range.index > c2.range.index) ? 1 : -1) : [];
  }
}

export class CustomImageSpec extends ImageSpec {
  getActions() {
    return [/*AlignAction,*/ DeleteAction, ResizeAction];
  }
}
/*

CUSTOM ALIGN ACTION FOR BOLT-FORMAT

export default class AlignAction extends Action {
  toolbar: Toolbar;
  aligner: Aligner;

  constructor(public formatter: BlotFormatter) {
    super(formatter);
    this.aligner = new CustomAligner(formatter.options.align);
    this.toolbar = new DefaultToolbar();
  }

  onCreate() {
    const toolbar = this.toolbar.create(this.formatter, this.aligner);
    this.formatter.overlay.appendChild(toolbar);
  }

  onDestroy() {
    const toolbar = this.toolbar.getElement();
    if (!toolbar) {
      return;
    }

    this.formatter.overlay.removeChild(toolbar);
    this.toolbar.destroy();
  }

  onUpdate() {
    //this.formatter.overlay
  }
}

const LEFT_ALIGN = 'left';
const CENTER_ALIGN = 'center';
const RIGHT_ALIGN = 'right';

export class CustomAligner implements Aligner {
  alignments: { [id: string]: Alignment; };
  alignAttribute: string;
  applyStyle: boolean;

  constructor(options: AlignOptions) {
    this.applyStyle = options.aligner.applyStyle;
    this.alignAttribute = options.attribute;
    this.alignments = {
      [LEFT_ALIGN]: {
        name: LEFT_ALIGN,
        icon: options.icons.left,
        apply: (el: HTMLElement) => {
          this.setAlignment(el, LEFT_ALIGN);
          this.setStyle(el, 'inline', 'left', '0 1em 1em 0');
        },
      },
      [CENTER_ALIGN]: {
        name: CENTER_ALIGN,
        icon: options.icons.center,
        apply: (el: HTMLElement) => {
          this.setAlignment(el, CENTER_ALIGN);
          this.setStyle(el, 'block', null, 'auto');
        },
      },
      [RIGHT_ALIGN]: {
        name: RIGHT_ALIGN,
        icon: options.icons.right,
        apply: (el: HTMLElement) => {
          this.setAlignment(el, RIGHT_ALIGN);
          this.setStyle(el, 'inline', 'right', '0 0 1em 1em');
        },
      },
    };
  }

  getAlignments(): Alignment[] {
    return Object.keys(this.alignments).map(k => this.alignments[k]);
  }

  clear(el: HTMLElement): void {
    el.removeAttribute(this.alignAttribute);
    this.setStyle(el, null, null, null);
  }

  isAligned(el: HTMLElement, alignment: Alignment): boolean {
    return el.getAttribute(this.alignAttribute) === alignment.name;
  }

  setAlignment(el: HTMLElement, value: string) {
console.log({el});
    el.setAttribute(this.alignAttribute, value);
  }

  setStyle(el: HTMLElement, display: string, float: string, margin: string) {
    if (this.applyStyle) {
      el.style.setProperty('display', display);
      el.style.setProperty('float', float);
      el.style.setProperty('margin', margin);
    }
  }
}
*/
