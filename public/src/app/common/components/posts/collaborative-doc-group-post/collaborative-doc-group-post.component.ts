import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { ActivatedRoute, Router, Route, ResolveEnd } from '@angular/router';
import {Location} from '@angular/common';

import QuillCursors from 'quill-cursors';
import ReconnectingWebSocket from 'reconnecting-websocket';
import * as ShareDB from '../../../../../../../node_modules/sharedb/lib/client';
//import {cursors} from '../../../../shared/utils/cursors';
// import {Mark, MarkDelete} from '../../../../shared/utils/quill.module.mark';
import {Mark} from '../../../../shared/utils/quill.module.mark';
import * as utils from '../../../../shared/utils/utils';
import { PostService } from '../../../../shared/services/post.service';
import { environment } from '../../../../../environments/environment';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnotifyService } from 'ng-snotify';
import { UserService } from '../../../../shared/services/user.service';
import * as chance from 'chance';
import { QuillAutoLinkService } from '../../../../shared/services/quill-auto-link.service';
import { DocumentService } from '../../../../shared/services/document.service';
import { Authorship } from '../../../../shared/utils/quill.module.authorship';


// !--Register Required Modules--! //
ShareDB.types.register(require('rich-text').type);
Quill.register('modules/cursors', QuillCursors);
Quill.register(Mark);
Quill.register(Authorship);
// !--Register Required Modules--! //

// !-- Variables Required to use and export Globally--! //
var postId: any;
var cursors: any = {}; 
var comment_range = {};
var quill: any;
var editor: any;
// !-- Variables Required to use and export Globally--! //


@Component({
  selector: 'app-collaborative-doc-group-post',
  templateUrl: './collaborative-doc-group-post.component.html',
  styleUrls: ['./collaborative-doc-group-post.component.scss']
})
export class CollaborativeDocGroupPostComponent implements OnInit {

 toolbarOptions = {
   container:[
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
    ['link'],
    ['authorship-toggle'],
    ['clean']                                         // remove formatting button
  ],
  handlers: {
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
              //quill.insertEmbed(range.index, 'image', environment.BASE_URL+'/uploads/'+url);
              quill.on('text-change', function(delta, oldDelta, source) {

              });
              //console.log(this.quill.getLength(), text.length, range.index);

              //here we delete the uploading text from the editor
              quill.deleteText(currentIndex, text.length);

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

  user_data: any;

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
    private quillInitializeService: QuillAutoLinkService) {
      postId = this._activatedRoute.snapshot.paramMap.get('postId');
     }

  async ngOnInit() {
    this.snotifyService.simple(`Please Hold on...`, {
      timeout: 100000,
      showProgressBar: false,
      backdrop:0.5,
      position: "centerTop"
    });    
   await this.initializeQuillEditor().then(()=>{
     this.getUser();
     this.getPost();
   })

  }

  ngOnDestroy(): void {
    this.snotifyService.clear();
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
      // !-- Connect ShareDB and Cursors to ReconnectingWebSocket--! //  
      var shareDBSocket = new ReconnectingWebSocket(((location.protocol === 'https:') ? 'wss' : 'ws') + '://' + environment.REAL_TIME_URL + '/sharedb');
      var shareDBConnection = new ShareDB.Connection(shareDBSocket);
      // Create browserchannel socket
      cursors.socket = new ReconnectingWebSocket(((location.protocol === 'https:') ? 'wss' : 'ws') + '://' + environment.REAL_TIME_URL + '/cursors');
      // !-- Connect ShareDB and Cursors to ReconnectingWebSocket--! //

      let connection: any = await this.documentService.cursorConnection(null, new chance().color({
        format: 'hex'
      }));

      let user = JSON.parse(localStorage.getItem('user'));

      let range = {
        index: 0,
        length: 0
      };

       quill = new Quill('#editor', {
        theme: 'snow',
        modules: {
          toolbar: this.toolbarOptions,
          authorship: {
            enabled: true,
            authorId: connection.user_id, // Current author id
            color: connection.color // Current author color
          },
          cursors:{
            hideDelayMs: 5000,
            hideSpeedMs: 0,
            selectionChangeSource: 'silent'
          },
          autoLink: true
        },
      });
  
      let doc = shareDBConnection.get('documents', postId);
    
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
      cursors.socket.onmessage = (message) => {
      
        var data = JSON.parse(message.data);     
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
            console.log('[cursors] User disconnected:', cursors.connections[i]);
      
            // If the source connection was removed set it
            if (data.sourceId == cursors.connections[i])
              source = cursors.connections[i];
          } else if (testConnection.name && !cursors.connections[i].name) {
            console.log('[cursors] User ' + testConnection.id + ' set username:', testConnection.name);
            console.log('[cursors] Connections after username update:', data.connections);
          }
        }
  
        if (cursors.connections.length == 0 && data.connections.length != 0) {
          //data.connections = removeDuplicates(data.connections, 'user_id');
          data.connections.forEach((element)=>{
            let authorData = {
              id: element.user_id,
              color: element.color,
              name: element.name,
              _post_id: postId
            };
             this.documentService.addAuthor(authorData)
            .subscribe((res)=>{
              console.log('Author added', res);
            }, (err)=>{
              console.log('Error while adding the author', err);
            })
          })
          console.log('[cursors] Initial list of connections received from server:', data.connections);
          reportNewConnections = false;
        }
      
        for (var i = 0; i < data.connections.length; i++) {
          // Set the source if it's still on active connections
          if (data.sourceId == data.connections[i].id)
            source = data.connections[i];
      
          if (reportNewConnections && !cursors.connections.find((connection) => {
              return connection.id == data.connections[i].id
            })) {
  
            //data.connections = removeDuplicates(data.connections, 'user_id');
            console.log('[cursors] User connected:', data.connections[i]);
             var authModule = new Authorship(quill, {
               enabled: true,
               authorId: data.connections[i]['user_id'],
               color: data.connections[i]['color']
              });
              let authorData = {
                id: authModule.authorId,
                color: authModule.color,
                name: cursors.localConnection.name,
                _post_id: postId
              };
               this.documentService.addAuthor(authorData)
              .subscribe((res)=>{
                console.log('Author added', res);
              }, (err)=>{
                console.log('Error while adding the author', err);
              })
            console.log('[cursors] Connections after new user:', data.connections);
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
      //subscribe ends
      this.documentService.updateCursors(cursors.localConnection, cursors, cursorsModule);
    
    // DEBUG
    
    shareDBConnection.on('state', (state: any, reason: any)=> {
  
      if (state === "connected") {
        cursors.localConnection.user_id = user.user_id;
        cursors.update();
      }
    
      console.log('[sharedb] New connection state: ' + state + ' Reason: ' + reason);
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
      // update editor contents
      let Document = await this.documentService.getDocumentHistory(postId, cursors);
      quill.setContents(Document);
      editor = document.getElementsByClassName("ql-editor")[0].innerHTML;
      this.snotifyService.clear();


      // local -> server
      quill.on('text-change', function (delta, oldDelta, source) {
        if (source == 'user') {

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
          console.log("An API action triggered this change.");
        }
      }); //text change ends

      // server -> local
      doc.on('op', function (op, source) {
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
          console.log('[cursors] Stopped typing, sending a cursor update/refresh.');
          this.documentService.sendCursorData(cursors, range);
          editor = document.getElementsByClassName("ql-editor")[0].innerHTML;
        }
      }, 1500);

      doc.on('nothing pending', debouncedSendCursorData, () => {
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
          console.log('Cursor not in the editor');
        }

      });

      //fired from cursor.js when a user is disconnected.
      // so we remove that cursor.
      document.addEventListener('cursors-update', (e: any) => {
        // Handle Removed Connections
        e.detail.removedConnections.forEach((connection: any) => {
          if (cursorsModule.cursors[connection.id])
            cursorsModule.removeCursor(connection.id);
        });
        this.documentService.updateCursors(e.detail.source, cursors, cursorsModule);
      });


    });
  }

}

export {comment_range, quill, editor};