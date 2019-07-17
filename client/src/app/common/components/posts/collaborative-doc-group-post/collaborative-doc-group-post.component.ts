import { Component, OnInit, Output, EventEmitter, Input, Inject,ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, Route, ResolveEnd } from '@angular/router';
import {Location} from '@angular/common';

import QuillCursors from 'quill-cursors';
import ReconnectingWebSocket, {Options} from 'reconnecting-websocket';
import * as ShareDB from '../../../../../../node_modules/sharedb/lib/client';
// import * as Quill from 'quill';
//import {cursors} from '../../../../shared/utils/cursors';
// import {Mark, MarkDelete} from '../../../../shared/utils/quill.module.mark';
import {Mark} from '../../../../shared/utils/quill.module.mark';
import * as utils from '../../../../shared/utils/utils';
import { PostService } from '../../../../shared/services/post.service';
import { environment } from '../../../../../environments/environment';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnotifyService } from 'ng-snotify';
import { UserService } from '../../../../shared/services/user.service';
import { GroupService } from '../../../../shared/services/group.service';
import * as chance from 'chance';
import { QuillAutoLinkService } from '../../../../shared/services/quill-auto-link.service';
import { DocumentService } from '../../../../shared/services/document.service';
import { Authorship } from '../../../../shared/utils/quill.module.authorship';
import { LayoutCol, LayoutRow } from '../../../../shared/utils/template-layout/quill.layout';
import { TableCell, TableRow, TableBody, TableContainer, tableId, TableModule } from '../../../../shared/utils/template-layout/quill.table';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';


import Mention from 'quill-mention';
import { MentionBlot } from '../../../../shared/utils/mention-module/quill.mention.blot'
import { Item } from 'angular2-multiselect-dropdown';
import deltaToHtml from 'delta-to-html';

Quill.register(MentionBlot);
Quill.register('modules/mention', Mention);
var Delta = require('quill-delta');
const quillTable = require('quill-table');

Quill.register(quillTable.TableCell);
Quill.register(quillTable.TableRow);
Quill.register(quillTable.Table);
Quill.register(quillTable.Contain);
Quill.register('modules/table', quillTable.TableModule);
const maxRows = 10;
const maxCols = 5;
let Parchment = Quill.import('parchment');
let Container = Quill.import('blots/container');
let Scroll = Quill.import('blots/scroll');

// !--Register Required Modules--! //
ShareDB.types.register(require('rich-text').type);
Quill.register('modules/cursors', QuillCursors);
Quill.register(Mark);
Quill.register(Authorship);



Quill.register({
  'blots/LayoutCol': LayoutCol,
  'blots/LayoutRow': LayoutRow
});
Quill.register({
  TableCell,
  TableRow,
  TableBody,
  TableContainer
})


// !--Register Required Modules--! //

// !-- Variables Required to use and export Globally--! //
var postId: any;
var cursors: any = {}; 
var comment_range = {};
var quill: any;
var editor: any;
var docAuthors: any = new Array();
// !-- Variables Required to use and export Globally--! //
var shareDBSocket: any;
var doc;


@Component({
  selector: 'app-collaborative-doc-group-post',
  templateUrl: './collaborative-doc-group-post.component.html',
  styleUrls: ['./collaborative-doc-group-post.component.scss']
})
export class CollaborativeDocGroupPostComponent implements OnInit {
  
 tableOptions = [];
 toolbarOptions = {
   container:[
    [{table: this.tableOptions}, {table: 'append-row'}, {table:'append-col'}],
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    ['blockquote', 'code-block'],
  
    [{ 'header': 1 }, { 'header': 2 }],               // custom button values
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
    [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
    [{ 'direction': 'rtl' }],                         // text direction
  
    [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  
    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    [{ 'font': [] }],
    [{ 'align': [] }],
    ['image', 'link'],
    ['authorship-toggle'],
    ['clean'],
    ['clear']                                         // remove formatting button
  ],
  handlers: {
    'clear': () => {
      
      quill.setContents(new Delta().insert("\n"));

    },
    'emoji': function () {
      //console.log('clicked');
    },
    'image': () => {
      //Creates an element which accepts image file as the input
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.click();

      // Listen upload local image and save to server
      input.onchange = () => {
        const file = input.files[0];
        const range = quill.getSelection();
        const text = '\nImage is being uploaded, please wait...';
        var length = quill.getLength();
        var currentIndex = quill.getSelection().index;
        quill.insertText(range.index, text, 'bold', true);

        // file type is only image.
        if (/^image\//.test(file.type)) {
          //here we are calling the upload Image API, which saves the image to server
          const fd = new FormData();
          fd.append('attachments', file);

          //Calling Custom XML HTTP REQUEST
          const xhr = new XMLHttpRequest();

          xhr.open('POST', environment.BASE_API_URL+'/posts/upload', true);
          xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));

          xhr.onload = () => {
            if (xhr.status === 200) {
              // this is callback data: url
              const url = JSON.parse(xhr.responseText).file[0].modified_name;

              //Here we insert the image and replace the BASE64 with our custom URL, which is been saved to the server
              //ex - img src = "http://localhost:3000/uploads/image-name.jpg"
              const range = quill.getSelection();
              let quillDelta = quill.insertEmbed(range.index, 'image', environment.BASE_URL+'/uploads/'+url, 'user');
              //console.log(this.quill.getLength(), text.length, range.index);
              //here we delete the uploading text from the editor
              quill.deleteText(currentIndex, text.length);
 
              // console.log(quillDelta);

              // doc.submitOp(quillDelta, {
              //   source: quill
              // }, (err: any) => {
              //   if (err)
              //     console.error('Submit OP returned an error:', err);
              // });
            }
          };
          xhr.send(fd);
        } else {
          console.warn('You could only upload images.');
        }
      };

    }
  }
};
  post: any;
  postTitle: any = 'Untitled';

  docStatus: any = "Updated!";
  user_data: any;
  user_document_information: any;
  document_imported_information: any;
  switchCheck = 0;
  dataCounter = 0;

  comments = [];
  comment_count = 0;


  constructor(private router: Router,
    private _activatedRoute: ActivatedRoute,
    private postService: PostService,
    private _location: Location,
    public ngxService: NgxUiLoaderService,
    private snotifyService: SnotifyService,
    private _userService: UserService,
    private documentService: DocumentService,
    private groupService: GroupService,
    private quillInitializeService: QuillAutoLinkService,
    public dialog: MatDialog) {
      postId = this._activatedRoute.snapshot.paramMap.get('postId');
     }

  async ngOnInit() {
    for (let r = 1; r <= maxRows; r++) {
      for (let c = 1; c <= maxCols; c++) {
        this.tableOptions.push('newtable_' + r + '_' + c);
      }
    }
    this.snotifyService.simple(`Please Hold on...`, {
      timeout: 100000,
      showProgressBar: false,
      backdrop:0.5,
      position: "centerTop"
    });
    await this.getUser().then(()=>{
      //grab user id then call for authors check
      this.documentService.getAuthors(postId)
      .subscribe((res)=>{
        // console.log(res)
          if(res.hasOwnProperty('authors')){
            var got_author:Boolean = false
            for(let i = 0; i < res['authors'].length; i++){
              if(res['authors'][i]['_user_id'] == this.user_data._id){
    // user is already an author pass author information here and start quill
                got_author = true
                this.user_document_information = res['authors'][i]
                this.initializeQuillEditor()
                this.getPost();
                break
              }
            }
            //else if this is the first init of this document to import document
            if(got_author == false && res['authors'].length == 0){
              this.groupService.getDocFileForEditorImport(postId)
              .subscribe((res) => {
                if(res['htmlConversion'] != null && res['htmlConversion'] != ""){
                  this.document_imported_information = res['htmlConversion']
                }
                this.initializeQuillEditor()
                this.getPost()
              }, (err) => {
                console.log("error",err)
              });
            }
            //else if the user is not in authors loop after import doc init check
            if (got_author == false && res['authors'].length > 0){
              this.initializeQuillEditor()
              this.getPost();
            }
          }else{
        //start quill if there are 0 authors for this doc
              this.initializeQuillEditor()
              this.getPost();
            }
      }, (err)=>{
        console.log('Error while fetching the authors', err);
      })
    });    
  
  }

  ngOnDestroy(): void {
    this.snotifyService.clear();
    shareDBSocket.close();
    cursors.socket.close();
  }

  getUser(){
    return new Promise((resolve, reject)=>{
      this._userService.getUser()
      .subscribe((res)=>{
        //console.log('Current User',res['user']);
        this.user_data = res['user'];
        resolve();
      }, (err)=>{
        console.log('Error while fetching the user', err);
        reject(err);
      })
    })
  }

  getPost(){
   return new Promise((resolve, reject)=>{
    this.postService.getPost(postId)
    .subscribe((res)=>{
      //console.log('Fetched post', res);
      this.postTitle = res['post']['title'];
      this.post = res['post'];
      this.comments = this.post.comments;
      this.comment_count = this.post.comments_count;
      resolve();
    }, (err)=>{
      console.log('Error while fetching the post', err);
      reject(err);
    })
   })
  }

  getPostTitle(event){
    this.postTitle = event;
  }

  backClicked() {
    this._location.back();
    shareDBSocket.close();
    cursors.socket.close();
  }

  removeDuplicates(originalArray: Array<Object>, objKey: any) {
    var trimmedArray = [];
    var values = [];
    var value;
  
    for(var i = 0; i < originalArray.length; i++) {
      value = originalArray[i][objKey];
  
      if(values.indexOf(value) === -1) {
        trimmedArray.push(originalArray[i]);
        values.push(value);
      }
    }
    return trimmedArray;
  
  }

  getDocument(postId){
    return new Promise((resolve, reject)=>{
      this.postService.getDocument(postId)
      .subscribe((res)=>{
        //console.log('Document Found', res);
        resolve();
      }, (err)=>{
        console.log('Error while fetching the document', err);
        reject(err);
      })
    })

  }

  async initializeQuillEditor() {

    try{
      const options: Options = {
        WebSocket: typeof window !== 'undefined' ? WebSocket : WebSocket, // custom WebSocket constructor
        connectionTimeout: 1000,
        maxRetries: 10,
    };
      // !-- Connect ShareDB and Cursors to ReconnectingWebSocket--! //  
      shareDBSocket = new ReconnectingWebSocket(((location.protocol === 'https:') ? 'wss' : 'ws') + '://' + environment.REAL_TIME_URL + '/sharedb', [], options);
      var shareDBConnection = new ShareDB.Connection(shareDBSocket);
      // Create browserchannel socket
      cursors.socket = new ReconnectingWebSocket(((location.protocol === 'https:') ? 'wss' : 'ws') + '://' + environment.REAL_TIME_URL + '/cursors', [], options);
      // !-- Connect ShareDB and Cursors to ReconnectingWebSocket--! //
      //have color here
      var colorFromUser:any
   
      if (this.user_document_information){
        colorFromUser = this.user_document_information['color']
      }else{
        colorFromUser = new chance().color({
          format: 'hex'
        })
      }

      let connection: any = await this.documentService.cursorConnection(null, colorFromUser);

      let user = JSON.parse(localStorage.getItem('user'));

      let range = {
        index: 0,
        length: 0
      };

      doc = shareDBConnection.get('documents', postId);
      let templateMention = [{
        'id':'brd-procedure-1',
        'value': 'Procedure Template 1'
      }, {
        'id':'brd-procedure-2',
        'value': 'Procedure Template 2'
      }, {
        'id':'brd-procedure-3',
        'value': 'Procedure Template 3'
      }]

       quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
          toolbar: this.toolbarOptions,
          table: true,
          //toolbar: '#toolbar',
          authorship: {
            enabled: true,
            authorId: connection.user_id, // Current author id
            //color: connection.color // Current author color
          },
          cursors:{
            hideDelayMs: 5000,
            hideSpeedMs: 0,
            selectionChangeSource: null
          },
          autoLink: true,
          mention: {
            allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
            mentionDenotationChars: ["/"],
            source: function (searchTerm, renderList, mentionChar) {
              let values;
              if (mentionChar === "/") {
                values = templateMention;
              }
    
              if (searchTerm.length === 0) {
                renderList(values, searchTerm);
              } else {
                const matches = [];
                for (var i = 0; i < values.length; i++)
                  if (~values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())) matches.push(values[i]);
                renderList(matches, searchTerm);
              }
            },
            onSelect:(item, insertItem) =>{
              insertItem(item);
              this.renderTemplate(item.id);

            }
          }
        },
      });
      
      let cursorsModule = quill.getModule('cursors');
     // cursorsModule.createCursor(1, 'User 1', 'red');

      // Init a blank user connection to store local conn data
      cursors.localConnection = connection;

      
      // Update
      cursors.update = function() {
        cursors.socket.send(JSON.stringify(cursors.localConnection));
      };
      
      // Init connections array
      cursors.connections = [];
      
      // Send initial message to register the client, and
      // retrieve a list of current clients so we can set a colour.
      cursors.socket.onopen = function() {
        cursors.update();
      };
      
      // Handle updates
      cursors.socket.onmessage = async (message) => {
      
        var data = JSON.parse(message.data);    
        this.documentService.authorsList(data); 
        var source = {},
          removedConnections = [],
          forceUpdate = false,
          reportNewConnections = true;
      
        if (!cursors.localConnection.id)
          forceUpdate = true;
      
        // Refresh local connection ID (because session ID might have changed because server restarts, crashes, etc.)
        cursors.localConnection.id = data.id;
      
        if (forceUpdate) {
          cursors.update();
          return;
        }
      
        //Find removed connections
        for (var i = 0; i < cursors.connections.length; i++) {
          var testConnection = data.connections.find( (connection) => {
            return connection.id == cursors.connections[i].id;
          });
      
          if (!testConnection) {
      
            removedConnections.push(cursors.connections[i]);
            //console.log('[cursors] User disconnected:', cursors.connections[i]);
      
            // If the source connection was removed set it
            if (data.sourceId == cursors.connections[i])
              source = cursors.connections[i];
          } else if (testConnection.name && !cursors.connections[i].name) {
            //console.log('[cursors] User ' + testConnection.id + ' set username:', testConnection.name);
            //console.log('[cursors] Connections after username update:', data.connections);
          }
        }
  
        if (cursors.connections.length == 0 && data.connections.length != 0) {
          //data.connections = removeDuplicates(data.connections, 'user_id');
          data.connections.forEach(async (element)=>{
            let authorData = {
              _user_id: element.user_id,
              color: element.color,
              name: element.name,
              _post_id: postId
            };
            var authModule = new Authorship(quill, {
              enabled: true,
              authorId: authorData._user_id,
              color: authorData.color
            });
          //add author
             this.documentService.addAuthor(authorData)
            .subscribe((res)=>{
              //console.log(res['message'], res);
            }, (err)=>{
              //console.log('Error while adding the author', err);
            })
            });

          this.documentService.getAuthors(postId)
          .subscribe((res)=>{
            //console.log('Authors for the document', res);
            if(res.hasOwnProperty('authors')){
              for(let i = 0; i < res['authors'].length; i++){
                //if(res['authors'][i]['_user_id'] != connection.user_id){
                  let connectionIndex = data.connections.findIndex(connection => (connection.user_id === res['authors'][i]['_user_id']));
                  if(connectionIndex === -1){
                    var authModule = new Authorship(quill, {
                      enabled: true,
                      authorId: res['authors'][i]['_user_id'],
                      color: res['authors'][i]['color']
                     });
                  }
                   //console.log(authModule);
                //}
              }
            }
          }, (err)=>{
            console.log('Error while fetching the authors', err);
          })
         // console.log('[cursors] Initial list of connections received from server:', data.connections);
          reportNewConnections = false;
        }
        if (this.switchCheck == 3){
          this.switchCheck = 0
        }
        //try to test out if connections
        if (this.dataCounter != data.connections.length && this.switchCheck == 1){
          this.switchCheck = 3
          //console.log(this.dataCounter, data.connections.length, cursors.connections.length)
          this.dataCounter = data.connections.length
        for (var i = 0; i < data.connections.length; i++) {
          // Set the source if it's still on active connections
          if (data.sourceId == data.connections[i].id)
            source = data.connections[i];
      
          if (reportNewConnections && !cursors.connections.find((connection) => {
              return connection.id == data.connections[i].id
            })) {
  
            //data.connections = removeDuplicates(data.connections, 'user_id');
            //console.log('[cursors] User connected:', data.connections[i]);
            let authorData = {
              _user_id: data.connections[i]['user_id'],
              color: data.connections[i]['color'],
              name: data.connections[i]['name'],
              _post_id: postId
            };
            var authModule = new Authorship(quill, {
              enabled: true,
              authorId: authorData._user_id,
              color: authorData.color
             });
               this.documentService.addAuthor(authorData)
              .subscribe((res)=>{
                var authModule = new Authorship(quill, {
                  enabled: true,
                  authorId: authorData._user_id,
                  color: authorData.color
                 });
                //console.log(res['message'], res);
              }, (err)=>{
                //console.log('Error while adding the author', err);
              });
              /*this.documentService.getAuthors(postId)
              .subscribe((res)=>{
                console.log('Authors for the document', res);
                docAuthors = res['authors'];
              }, (err)=>{
                console.log('Error while fetching the authors', err);
              })*/
            //console.log('[cursors] Connections after new user:', data.connections);
          }
        }
      }
        // Update connections array
        cursors.connections = data.connections;
        //cursors.connections = removeDuplicates(cursors.connections, 'user_id');
      
        // Fire event
        document.dispatchEvent(new CustomEvent('cursors-update', {
          detail: {
            source: source,
            removedConnections: removedConnections
          }
        }));
      };
      
      cursors.socket.onclose = function (event) {
        console.log('[cursors] Socket closed. Event:', event);
      };
      
      cursors.socket.onerror = function (event) {
        console.log('[cursors] Error on socket. Event:', event);
      };
  
      this.handleDocument(doc, user, cursorsModule);

      //fired from cursor.js when a user is disconnected.
      // so we remove that cursor.
      document.addEventListener('cursors-update', (e: any) => {
        // Handle Removed Connections
        e.detail.removedConnections.forEach((connection: any) => {
          if (cursorsModule.cursors[connection.id])
            cursorsModule.removeCursor(connection.id);
        });
        //this.documentService.updateCursors(e.detail.source, cursors, cursorsModule);
      });

      //subscribe ends
      //this.documentService.updateCursors(cursors.localConnection, cursors, cursorsModule);
    
    // DEBUG
    
    shareDBConnection.on('state', (state: any, reason: any)=> {
  
      if (state === "connected") {
        cursors.localConnection.user_id = user.user_id;
        cursors.update();
      }
    
      //console.log('[sharedb] New connection state: ' + state + ' Reason: ' + reason);
    });
    } 
    catch(err){
      console.log('Error', err);
    }

  }

  handleDocument(doc, user, cursorsModule) {
    doc.subscribe(async () => {
      if (!doc.type)
        doc.create([{
          insert: '\n'
        }], 'rich-text');
        this.docStatus = "Updating...";
      // update editor contents
      let Document = await this.documentService.getDocumentHistory(postId, cursors);
      quill.setContents(Document);
      //let html = quill.clipboard.convert(Document);
      editor = document.getElementsByClassName("ql-editor")[0].innerHTML;
      let tds = document.getElementsByTagName("td");
      if(tds){
        this.documentService.getTableCells(postId)
        .subscribe((res)=>{
          console.log('Formatted table cells', res);
          if(tds.length !=0){
            for(let i = 0 ; i < tds.length; i++){
              let tableCellIndex = res['tableCells'].findIndex((element)=> element._cell_id === tds[i]['attributes']['cell_id']['value']);
              if(tableCellIndex != -1){
                tds[i]['bgColor'] = res['tableCells'][tableCellIndex]['_color']
                console.log('Table Cell', tableCellIndex);
              }
              
            }
          }
        }, (err)=>{
          console.log('Error occured while fetching the table cells', err);
        })
      }
      this.snotifyService.clear();
      this.docStatus = "Updated!";
      if(this.document_imported_information && this.document_imported_information != "" && this.document_imported_information != null){
        quill.clipboard.dangerouslyPasteHTML(0,this.document_imported_information,'user')
      }
    });

    // local -> server
    quill.on('text-change', (delta, oldDelta, source) => {
      this.docStatus = "Updating...";
      if (source == 'user') {
        // console.log(delta, quill.getContents());
        // //console.log(editor);
        // let elem = document.createElement('html');
        // elem.innerHTML = editor;
        // console.log(elem);
        // quill.clipboard.dangerouslyPasteHTML(0, elem, 'user');
        // Check if it's a formatting-only delta
        var formattingDelta = delta.reduce(function (check, op) {
          return (op.insert || op.delete) ? false : check;
        }, true);

        // If it's not a formatting-only delta, collapse local selection
        if (
          !formattingDelta &&
          cursors.localConnection.range &&
          cursors.localConnection.range.length
        ) {
          cursors.localConnection.range.index += cursors.localConnection.range.length;
          cursors.localConnection.range.length = 0;
          cursors.update();

        }
        delta.user_id = user.user_id;
        doc.submitOp(delta, {
          source: quill
        }, (err: any) => {
          if (err)
            console.error('Submit OP returned an error:', err);
        });
      }
      else if (source == 'api') {
       // console.log("An API action triggered this change.");
      }
    }); //text change ends

    // server -> local
    doc.on('op', function (op, source) {
      this.docStatus = "Updating...";
      if (source !== quill) {
        //console.log("cursors.connections: ", cursors.connections);
        /*let cursor = cursors.connections.find(el => el.user_id === op.user_id);
        op.ops = op.ops.map((item: any) => {
          if (item.insert) {
                item.attributes = item.attributes || {};
                item.attributes.mark = {id: cursor.id, style: {color: cursor.color}, user: cursor.name};
          }
          return item;
        });*/
        quill.updateContents(op);
      }
    })
    //doc op ends // data coming from server as doc as some data.

    //
    var debouncedSendCursorData = utils.debounce(async () => {
      var range = quill.getSelection();
      if (range) {
        //console.log('[cursors] Stopped typing, sending a cursor update/refresh.');
        this.docStatus = "Updated!";
        this.documentService.sendCursorData(cursors, range);
        editor = document.getElementsByClassName("ql-editor")[0].innerHTML;
      }
    }, 1500);

    doc.on('nothing pending', debouncedSendCursorData, () => {
      this.docStatus = "Updated!";
    });

    quill.on('selection-change', (range: any, oldRange: any, source: any) => {
      this.documentService.sendCursorData(cursors, range);
      if (range) {
        if (range.length == 0) {
          //console.log('User cursor is on', range.index);
        } else {
          var text = quill.getText(range.index, range.length);
          comment_range = range;
          //console.log('Comment Range', comment_range);
          //console.log("User has highlighted: ", text);
        }
      } else {
        //console.log('Cursor not in the editor', source);
      }

    });
  }

  renderTemplate(id?){

    let options = new Object();
    if(id === 'brd-procedure-1'){
      options['color'] = "red";
      this.table_handler('newtable_1_1', quill, options);
      this.table_handler('newtable_2_2', quill);
    } else if(id === 'brd-procedure-2'){
      options['color'] = "#808080";
      this.table_handler('newtable_1_1', quill, options);
      this.table_handler('newtable_6_2', quill);
    } else if(id === 'brd-procedure-3'){
      options['color'] = "#D3D3D3";
      this.table_handler('newtable_1_1', quill, options);
      this.table_handler('newtable_3_4', quill);
    }
    
  }

  random_id() {
    return Math.random().toString(36).slice(2)
  }

  find_td(quill) {
    let leaf = quill.getLeaf(quill.getSelection()['index']);
    let blot = leaf[0];
    for (; blot != null && blot.statics.blotName != 'td';) {
      blot = blot.parent;
    }
    return blot; // return TD or NULL
  }

  table_handler(value, quill, options?) {
    if (value.includes('newtable_')) {
      let node = null;
      let sizes = value.split('_');
      let row_count = Number.parseInt(sizes[1]);
      let col_count = Number.parseInt(sizes[2]);
      let table_id = this.random_id();
      let cell_id;
      let table = Parchment.create('table', table_id);
      for (var ri = 0; ri < row_count; ri++) {
        let row_id = this.random_id();
        let tr = Parchment.create('tr', row_id);
        table.appendChild(tr);
        for (var ci = 0; ci < col_count; ci++) {
          cell_id = this.random_id();
          value = table_id + '|' + row_id + '|' + cell_id;
          let td = Parchment.create('td', value);
          tr.appendChild(td);
          let p = Parchment.create('block');
          td.appendChild(p);
          let br = Parchment.create('break');
          p.appendChild(br);
          node = p;
        }
      }
      let leaf = quill.getLeaf(quill.getSelection()['index']);
      let blot = leaf[0];
      let top_branch = null;
      console.log(table.domNode);
      if(options){
        let tableCellData = {
          _post_id: postId,
          _cell_id: cell_id,
          _color: options.color
        }

        this.documentService.addTableCells(tableCellData)
        .subscribe((res)=>{
          console.log("Table Cell Formatted", res);
        }, (err)=>{
          console.log("Error while adding table cells!", err);
        })
        let td = table.domNode.getElementsByTagName('td')[0];
        td.bgColor = tableCellData._color;
      }
      for (; blot != null && !(blot instanceof Container || blot instanceof Scroll);) {
        top_branch = blot;
        blot = blot.parent;
      }
      blot.insertBefore(table, top_branch);
      return node;
    } else if (value === 'append-col') {
      let td = this.find_td(quill);
      if (td) {
        let table = td.parent.parent;
        let table_id = table.domNode.getAttribute('table_id');
        table.children.forEach(function (tr) {
          let row_id = tr.domNode.getAttribute('row_id');
          let cell_id = this.random_id();
          let td = Parchment.create('td', table_id + '|' + row_id + '|' + cell_id);
          tr.appendChild(td);
        });
      }
    } else if (value === 'append-row') {
      let td = this.find_td(quill);
      if (td) {
        let col_count = td.parent.children.length;
        let table = td.parent.parent;
        let new_row = td.parent.clone();
        let table_id = table.domNode.getAttribute('table_id');
        let row_id = this.random_id();
        new_row.domNode.setAttribute('row_id', row_id);
        for (let i = col_count - 1; i >= 0; i--) {
          let cell_id = this.random_id();
          let td = Parchment.create('td', table_id + '|' + row_id + '|' + cell_id);
          new_row.appendChild(td);
          let p = Parchment.create('block');
          td.appendChild(p);
          let br = Parchment.create('break');
          p.appendChild(br);
        }
        table.appendChild(new_row);
        console.log(new_row);
      }
    } else {
      let table_id = this.random_id();
      let table = Parchment.create('table', table_id);

      let leaf = quill.getLeaf(quill.getSelection()['index']);
      let blot = leaf[0];
      let top_branch = null;
      for (; blot != null && !(blot instanceof Container || blot instanceof Scroll);) {
        top_branch = blot;
        blot = blot.parent;
      }
      blot.insertBefore(table, top_branch);
      return table;
    }
  }
  testpreview:String = ''
  previewbool:Boolean = false
  showPreview(){
    this.previewbool = true
    //console.log(document.getElementsByClassName("ql-editor")[0].innerHTML)
   // this.testpreview = '<table table_id="ipjzc9jnp3"><tr row_id="oqwih21bu5"><td table_id="ipjzc9jnp3" row_id="oqwih21bu5" cell_id="x6lgixhvps"><p><br></p></td></tr></table><table table_id="npc7c1oyx3q"><tr row_id="p0ctv6fso99"><td table_id="npc7c1oyx3q" row_id="p0ctv6fso99" cell_id="0d3oruz68pcm"><p><span class="ql-author-5d0a6e0d342bf74ff5732a21">sasdasdasd</span></p></td></tr></table><table table_id="f0ni22jicya"><tr row_id="umw39l8hlpf"><td table_id="f0ni22jicya" row_id="umw39l8hlpf" cell_id="5lhc0zon4ji"><p><span class="ql-author-5d0a6e0d342bf74ff5732a21">asdasdasdasd</span></p><p><span class="ql-author-5d0a6e0d342bf74ff5732a21">asdasd</span></p><p><span class="ql-author-5d0a6e0d342bf74ff5732a21">asdasd</span></p><p><span class="ql-author-5d0a6e0d342bf74ff5732a21">asdasd</span></p></td><td table_id="f0ni22jicya" row_id="umw39l8hlpf" cell_id="luuma5eznum"><p><br></p></td><td table_id="f0ni22jicya" row_id="umw39l8hlpf" cell_id="7fgz4csfl3"><p><span class="ql-author-5d0a6e0d342bf74ff5732a21">asdasdasd</span></p></td><td table_id="f0ni22jicya" row_id="umw39l8hlpf" cell_id="s9wa4a8bf8"><p><br></p></td><td table_id="f0ni22jicya" row_id="umw39l8hlpf" cell_id="42rriea4h8u"><p><br></p></td><td table_id="f0ni22jicya" row_id="umw39l8hlpf" cell_id="ft1ebpz3y3"><p><span class="ql-author-5d0a6e0d342bf74ff5732a21">asdasdsa</span></p></td><td table_id="f0ni22jicya" row_id="umw39l8hlpf" cell_id="hrctq36j53"><p><br></p></td><td table_id="f0ni22jicya" row_id="umw39l8hlpf" cell_id="3kpz0i18p8v"><p><br></p></td><td table_id="f0ni22jicya" row_id="umw39l8hlpf" cell_id="mflnwbkvuhk"><p><br></p></td><td table_id="f0ni22jicya" row_id="umw39l8hlpf" cell_id="u5kacq9sb6"><p><br></p></td><td table_id="f0ni22jicya" row_id="umw39l8hlpf" cell_id="qqfioaw8b9b"><p><br></p></td><td table_id="f0ni22jicya" row_id="umw39l8hlpf" cell_id="l14hxfrc61j"><p><br></p></td><td table_id="f0ni22jicya" row_id="umw39l8hlpf" cell_id="x6m9xc6ur9"><p><br></p></td><td table_id="f0ni22jicya" row_id="umw39l8hlpf" cell_id="k17wj2hct8l"><p><br></p></td><td table_id="f0ni22jicya" row_id="umw39l8hlpf" cell_id="1kg4bnrjjgb"><p><br></p></td><td table_id="f0ni22jicya" row_id="umw39l8hlpf" cell_id="36ktnerla4e"><p><br></p></td><td table_id="f0ni22jicya" row_id="umw39l8hlpf" cell_id="641c6xu9njr"><p><br></p></td><td table_id="f0ni22jicya" row_id="umw39l8hlpf" cell_id="g3tvzr5ptce"><p><br></p></td><td table_id="f0ni22jicya" row_id="umw39l8hlpf" cell_id="7rauojsxkxw"><p><br></p></td></tr><tr row_id="pfav2mpwe"><td table_id="f0ni22jicya" row_id="pfav2mpwe" cell_id="pnsv94p1zug"><p><br></p></td><td table_id="f0ni22jicya" row_id="pfav2mpwe" cell_id="fqr237l08h"><p><span class="ql-author-5d0a6e0d342bf74ff5732a21">asdasd</span></p></td><td table_id="f0ni22jicya" row_id="pfav2mpwe" cell_id="urq83l5jes"><p><br></p></td><td table_id="f0ni22jicya" row_id="pfav2mpwe" cell_id="22mu4927gxx"><p><br></p></td><td table_id="f0ni22jicya" row_id="pfav2mpwe" cell_id="u65nmc3vq8"><p><br></p></td><td table_id="f0ni22jicya" row_id="pfav2mpwe" cell_id="rb32a5pxn0k"><p><span class="ql-author-5d0a6e0d342bf74ff5732a21">sadasdasd</span></p></td><td table_id="f0ni22jicya" row_id="pfav2mpwe" cell_id="6e7wfjdz25w"><p><br></p></td><td table_id="f0ni22jicya" row_id="pfav2mpwe" cell_id="idrknxkay2s"><p><br></p></td><td table_id="f0ni22jicya" row_id="pfav2mpwe" cell_id="jpwce420oq"><p><br></p></td><td table_id="f0ni22jicya" row_id="pfav2mpwe" cell_id="5lqulg0s36m"><p><br></p></td><td table_id="f0ni22jicya" row_id="pfav2mpwe" cell_id="8mhxsje91pv"><p><br></p></td><td table_id="f0ni22jicya" row_id="pfav2mpwe" cell_id="wpd0u009b5"><p><br></p></td><td table_id="f0ni22jicya" row_id="pfav2mpwe" cell_id="wgopa4gmdrs"><p><br></p></td><td table_id="f0ni22jicya" row_id="pfav2mpwe" cell_id="kzpffot53m"><p><br></p></td><td table_id="f0ni22jicya" row_id="pfav2mpwe" cell_id="2zhetmxhmdb"><p><br></p></td><td table_id="f0ni22jicya" row_id="pfav2mpwe" cell_id="ytluilsfgx"><p><br></p></td><td table_id="f0ni22jicya" row_id="pfav2mpwe" cell_id="enufb29u0t8"><p><br></p></td><td table_id="f0ni22jicya" row_id="pfav2mpwe" cell_id="d6vx7lbz3d6"><p><br></p></td><td table_id="f0ni22jicya" row_id="pfav2mpwe" cell_id="gw03ckx60zs"><p><br></p></td></tr></table><table table_id="w40vewk2r"><tr row_id="gnqtlu0gili"><td table_id="w40vewk2r" row_id="gnqtlu0gili" cell_id="wqlnhomc8oi"><p><br></p><p><br></p><p><br></p><p><br></p><p><span class="ql-author-5d0a6e0d342bf74ff5732a21">asdasd</span></p><p><br></p><p><br></p><p><br></p><p><span class="ql-author-5d0a6e0d342bf74ff5732a21">asd</span></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><br></p><p><span class="ql-author-5d0a6e0d342bf74ff5732a21">qweqweqweqweqweqweqwe</span></p></td></tr></table><table table_id="37tdlj65cwd"><tr row_id="xx4cyj4e8hb"><td table_id="37tdlj65cwd" row_id="xx4cyj4e8hb" cell_id="iqxugf7m4tl"><p><br></p></td><td table_id="37tdlj65cwd" row_id="xx4cyj4e8hb" cell_id="m1rvyrlk5ta"><p><br></p></td></tr><tr row_id="61y051satvf"><td table_id="37tdlj65cwd" row_id="61y051satvf" cell_id="ah66x5hvt7l"><p><br></p></td><td table_id="37tdlj65cwd" row_id="61y051satvf" cell_id="jhjp1zb4iwk"><p><br></p></td></tr></table>';
   this.testpreview = document.getElementsByClassName("ql-editor")[0].innerHTML 
  // console.log("clicked calle", this.previewbool)  
    // let dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
      //   width: '100vh',
      //   height:  '100vh',
      //   maxWidth: '100vh',
      //   maxHeight: '100vh',
      //   hasBackdrop: false
      // });
  }
  closePreview(event:string){
    //console.log("calledlldle1",event)
    this.previewbool = false
    //console.log(this.previewbool)
  }
}

export {comment_range, quill, editor, docAuthors};

@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'dialog-overview-example-dialog.html',
  styleUrls: ['dialog-overview-example-dialog.css'],
})
export class DialogOverviewExampleDialog {
  private _editorData: string = "";
  private _editorDataArray = new Array(1).fill([])
  currentpage = 0

  @Input() set receivedParentMessage(value: string) {
    var docTypeValue = `<!DOCTYPE html><html><head></head><body>${value}</body></html>`
    var pars = (new DOMParser()).parseFromString(docTypeValue, "text/html");
   // console.log(pars,"pars",value)
    var x = pars.documentElement.childNodes;
    console.log(x)

    for (let i = 0; i < x.length ; i++) {
     //console.log("node", x[i].childNodes)
      const innerFirstElementNode = x[i].childNodes
      if(innerFirstElementNode.length > 0){
        for (let k = 0; k < innerFirstElementNode.length; k++){
         // console.log(innerFirstElementNode[k])
          var el = document.createElement("div");
          el.appendChild(innerFirstElementNode[k]);
          //console.log("innerFirstElementNode[k]",innerFirstElementNode[k],"breakrekakreakarkaekaerakraekr", el.innerHTML)
          //console.log(el.innerHTML,"teststststststsststststststst",innerFirstElementNode[k])
          //console.log(this.currentpage,"pageeoeoeoe")
          this._editorDataArray[this.currentpage] += el.innerHTML
          //console.log(this._editorDataArray)
         // this._editorData += el.innerHTML
          
          this.changeDetector.detectChanges()
          var pagePreviewHeight = document.getElementsByClassName('pagePreview')[this.currentpage].clientHeight;
          //console.log(pagePreviewHeight,"height")
          if (pagePreviewHeight <= 1100){
            //console.log("is lessthan")
            
          }
          if (pagePreviewHeight > 1100){
            //last element added
            //console.log("thisis before removal", el.innerHTML)
            //this._editorDataArray[this.currentpage].replace(el.innerHTML,"")

            // var pageHtml = document.getElementsByClassName('pagePreview')[this.currentpage].innerHTML
            // var parsePreview = (new DOMParser()).parseFromString(pageHtml, "text/html");
            // var previewNodes = parsePreview.documentElement.childNodes;

            // for (let e = 0; e < previewNodes.length ; e++) {
            //    const innerFirstPreviewElementNode = previewNodes[e].childNodes
            //    console.log(innerFirstPreviewElementNode)
            //    if(innerFirstElementNode.length > 0){
            //      for (let k = 0; k < innerFirstElementNode.length; k++){
            //        //console.log(innerFirstElementNode[k])
            //        var el = document.createElement("div");
            //        el.appendChild(innerFirstElementNode[k]);
            //        //console.log("innerFirstElementNode[k]",innerFirstElementNode[k],"breakrekakreakarkaekaerakraekr", el.innerHTML)
            //        //console.log(el.innerHTML,"teststststststsststststststst",innerFirstElementNode[k])
            //        if (el.innerHTML != undefined || el.innerHTML != "")
            //        //console.log(this.currentpage,"pageeoeoeoe")
            //        this._editorDataArray[this.currentpage] += el.innerHTML
            //        //console.log(this._editorDataArray)
            //       // this._editorData += el.innerHTML

            //      }
            //    }
            //  }


 ///////// new one here
             this.currentpage += 1
            // console.log("replaced",this._editorDataArray)
            this._editorDataArray = [...this._editorDataArray, ""]
            //console.log(this.currentpage,"pageeoeoeoe23232323232323")
            //console.log("added to new array",this._editorDataArray)
          }
        }
      }
    }
    //this._editorData = value;

 }
  
  @Output() closeView11: EventEmitter<any> = new EventEmitter();


  get receivedParentMessage(): string {

      return this._editorData;

  }


  isShowing:Boolean = true

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    private changeDetector: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
    }
    get editorInformation():String{
      console.log(this.receivedParentMessage)
      return this.receivedParentMessage
    }

  onNoClick(): void {
    console.log("clickedon")
    //this.receivedParentMessage = ""
    this.isShowing = false
    this.closeView11.emit('Click on close preview');

  }
  stopNoClickChild(){
    event.stopPropagation();
  }

}