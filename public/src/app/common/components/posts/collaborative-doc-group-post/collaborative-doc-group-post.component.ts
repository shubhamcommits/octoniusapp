import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { ActivatedRoute, Router, Route, ResolveEnd } from '@angular/router';
import {Location} from '@angular/common';

import QuillCursors from 'quill-cursors';
import ReconnectingWebSocket from 'reconnecting-websocket';
import * as ShareDB from '../../../../../../../node_modules/sharedb/lib/client';
import {cursors} from '../../../../shared/utils/cursors';
// import {Mark, MarkDelete} from '../../../../shared/utils/quill.module.mark';
import {Mark} from '../../../../shared/utils/quill.module.mark';
import * as utils from '../../../../shared/utils/utils';
import { PostService } from '../../../../shared/services/post.service';
import { ConnectionHistoryService } from '../../../../shared/services/connectionhistory.service';
import { environment } from '../../../../../environments/environment';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { SnotifyService, SnotifyPosition, SnotifyToastConfig } from 'ng-snotify';
import { UserService } from '../../../../shared/services/user.service';
import * as chance from 'chance';
import { QuillAutoLinkService } from '../../../../shared/services/quill-auto-link.service';

var postId: any;
var groupId: any;
var postData = new Object();
var cursors: any = {}; 
var comment_range = {};
var quill: any;

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
    ['link', 'image', 'video'],
  
    ['clean']                                         // remove formatting button
  ],
  handlers: {
    'emoji': function () {
      //console.log('clicked');
    }
  }
};

  post: any;
  postTitle: any = 'Untitled';

  user_data: any;

  comments = [];
  comment_count = 0;


  constructor(
    private router: Router,
    private _activatedRoute: ActivatedRoute,
    private postService: PostService,
    private connectionHistoryService: ConnectionHistoryService,
    private _location: Location,
    public ngxService: NgxUiLoaderService,
    private snotifyService: SnotifyService,
    private _userService: UserService,
    private quillInitializeService: QuillAutoLinkService) {
      postId = this._activatedRoute.snapshot.paramMap.get('postId');
      groupId = this._activatedRoute.snapshot.paramMap.get('id');
     }

    private subscription;

  async ngOnInit() {
    this.snotifyService.simple(`Please Hold on...`, {
      timeout: 5000,
      showProgressBar: false,
      backdrop:0.5,
      position: "centerTop"
    });
   await this.initializeQuillEditor().then(()=>{
     this.getPost();
     this.getUser();
   })

  }

  getUser(){
    return new Promise((resolve, reject)=>{
      this._userService.getUser()
      .subscribe((res)=>{
        //console.log('Current User', res['user']);
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

  updateConnectionHistory(history) {
    return new Promise((resolve, reject)=>{
      this.connectionHistoryService.updateConnectionHistory(history)
      .subscribe(()=>{
        resolve();
      }, (err)=>{
        console.log('Error while updating connection history', err);
        reject(err);
      })
     })
  }

  getPostTitle(event){
    //console.log('Post title', event);
    this.postTitle = event;
  }


  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
   clearInterval(this.subscription);
  }

  backClicked() {
    this._location.back();
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

  editPost(documentId){
    const post = {
      'title': this.postTitle,
      'content': postData['content'],
      'type': 'document'
    };
    return new Promise((resolve, reject)=>{
      this.postService.editPost(documentId, post)
      .subscribe((res)=>{
        //console.log('Data saved into post Sucessfully', res);
        this.post = res['post'];
        resolve();
      }, (err)=>{
        console.log('Error while saving the post', err);
        reject(err);
      })
    })

  }

  test(){
    Quill.setSelection(100, 7);
  }


  async initializeQuillEditor() {
    let self = this;
    //this.ngxService.startBackground();

    ShareDB.types.register(require('rich-text').type);
  
    Quill.register('modules/cursors', QuillCursors);

    Quill.register(Mark);

    // Quill.register(MarkDelete);

     function CursorConnection(name, color,range) {

      const getUserName = new XMLHttpRequest();
    
      if(JSON.parse(localStorage.getItem('user'))!= null){
        getUserName.open('GET', environment.BASE_API_URL+`/users/getOtherUser/`+ JSON.parse(localStorage.getItem('user')).user_id, true);
        getUserName.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
      
        getUserName.onload = () => {
          if (getUserName.status === 200) {
            //console.log('User Details', JSON.parse(getUserName.responseText));
              // id being generated on server. Amit
            this.name = JSON.parse(getUserName.responseText).user.first_name +" " +JSON.parse(getUserName.responseText).user.last_name;
            this.color = color;
            this.range = range;
          }
          else {
            console.log('Error while fetching user details', JSON.parse(getUserName.responseText));
      
          }
        };
        getUserName.send();
      }
    
      else {

      }
    
    
    }
    
    // Create browserchannel socket
    //cursors.socket = new ReconnectingWebSocket(((location.protocol === 'https:') ? 'wss' : 'ws') + '://' + 'localhost:3001' + '/cursors');
    //cursors.socket = new ReconnectingWebSocket(environment.REAL_TIME_URL + '/cursors');
    cursors.socket = new ReconnectingWebSocket(((location.protocol === 'https:') ? 'wss' : 'ws') + '://' + environment.REAL_TIME_URL + '/cursors');
    // socketStateEl.innerHTML = 'connecting';
    // socketIndicatorEl.style.backgroundColor = 'silver';
    
    // Init a blank user connection to store local conn data
     cursors.localConnection = new CursorConnection(
      null,
      new chance().color({
        format: 'hex'
      }), null
    );
    
    // Update
    cursors.update = function() {
      cursors.socket.send(JSON.stringify(cursors.localConnection));
    };
    
    // Init connections array
    cursors.connections = [];
    
    // Send initial message to register the client, and
    // retrieve a list of current clients so we can set a colour.
    cursors.socket.onopen = function() {
      // socketStateEl.innerHTML = 'connected';
      // socketIndicatorEl.style.backgroundColor = 'lime';
      cursors.update();
    };
    
    // Handle updates
    cursors.socket.onmessage = function(message) {
    
      var data = JSON.parse(message.data);
      //console.log(data);
    
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
    
      // Find removed connections
      for (var i = 0; i < cursors.connections.length; i++) {
        var testConnection = data.connections.find(function(connection) {
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
        console.log('[cursors] Initial list of connections received from server:', data.connections);
        reportNewConnections = false;
      }
    
      for (var i = 0; i < data.connections.length; i++) {
        // Set the source if it's still on active connections
        if (data.sourceId == data.connections[i].id)
          source = data.connections[i];
    
        if (reportNewConnections && !cursors.connections.find(function(connection) {
            return connection.id == data.connections[i].id
          })) {
    
          console.log('[cursors] User connected:', data.connections[i]);
          console.log('[cursors] Connections after new user:', data.connections);
        }
      }
    
      // Update connections array
      cursors.connections = data.connections;
    
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
      // socketStateEl.innerHTML = 'closed';
      // socketIndicatorEl.style.backgroundColor = 'red';
    };
    
    cursors.socket.onerror = function (event) {
      console.log('[cursors] Error on socket. Event:', event);
      // socketStateEl.innerHTML = 'error';
      // socketIndicatorEl.style.backgroundColor = 'red';
    };
    
  
   // var shareDBSocket = new ReconnectingWebSocket(((location.protocol === 'https:') ? 'wss' : 'ws') + '://' + 'localhost:3001' + '/sharedb');
  
  // var shareDBSocket = new ReconnectingWebSocket(environment.REAL_TIME_URL + '/sharedb');

    var shareDBSocket = new ReconnectingWebSocket(((location.protocol === 'https:') ? 'wss' : 'ws') + '://' + environment.REAL_TIME_URL + '/sharedb');

    var shareDBConnection = new ShareDB.Connection(shareDBSocket);
    
     quill = new Quill('#editor', {
      theme: 'snow',
      modules: {
        toolbar: this.toolbarOptions,
        cursors:true,
        autoLink: true
        // cursors: {
        //    autoRegisterListener: false
        // },
      },
    });

    var doc = shareDBConnection.get('documents', postId);


  
    var cursorsModule = quill.getModule('cursors');
    var Delta = Quill.import('delta');
    // I think this function is deprecated/removed from the latest code on repo.
    // cursorsModule.registerTextChangeListener(); // now private

    // !--Function to Fetch the document from database--! //
    async function getDocumentHistory(documentId){
      
      return new Promise((resolve, reject) => {
        const getDocDetails = new XMLHttpRequest();
        getDocDetails.open('GET', environment.BASE_API_URL+`/posts/documents/history/`+ documentId, true);
        getDocDetails.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'));
      
        getDocDetails.onload = () => {
          if (getDocDetails.status === 200) {
            let documentHistory = JSON.parse(getDocDetails.responseText).documentHistory;
            let document = new Delta(); 
            let markColors = {};
            let user = JSON.parse(localStorage.getItem('user'));
            documentHistory.forEach((item) => {
              if (item.src && item.src !== user.user_id) {
                let color = markColors[item.src] || new chance().color({format: 'hex'});
                markColors[item.src] = color
                item.ops.map((op) => {
                  if (op.insert) {
                    op.attributes = op.attributes || {};
                    op.attributes.mark = {id: item.src, style: {color: color}};
                  }
                  return op;
                })
              }
              document = document.compose(new Delta(item.ops));
            })
            // quill.setContents(document);
            resolve(document);
          }
          else {
            console.log('Error while fetching document details', JSON.parse(getDocDetails.responseText));
            reject();
          }
        };
        getDocDetails.send();
      })
      
    }

    
    doc.subscribe(function(err) {
    
      if (err) throw err;
    
      if (!doc.type)
        doc.create([{
          insert: '\n'
        }], 'rich-text');
      // update editor contents
      // updateConnectionHistory(postId).then()
      let user = JSON.parse(localStorage.getItem('user'));
      self.updateConnectionHistory({doc: postId, src: shareDBConnection.id, user: user.user_id}).then(() => {
        getDocumentHistory(postId).then((document) => {
          quill.setContents(document);
        });
      // updateCursors(cursors.localConnection);
    }); //subscribe ends


  
    // local -> server
    quill.on('text-change', function(delta, oldDelta, source) {
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
  
        doc.submitOp(delta, {
          source: quill
        }, function(err) {
          if (err)
            console.error('Submit OP returned an error:', err);
        });
  
        // updateUserList();
      }
    }); //text change ends
  
    // cursorsModule.registerTextChangeListener();
  
    // server -> local
    doc.on('op', function(op, source) {
      if (source !== quill) {
        let cursor = cursors.connections.find(el => el.editorId === op.editorId);
        op.ops = op.ops.map((item) => {
          if (item.insert) {
            item.attributes = item.attributes || {};
            item.attributes.mark = {id: cursor.id, style: {color: cursor.color}};
          }
          // if (item.delete) {
          //   item = {
          //     retain: item.delete,
          //     attributes: {
          //       "mark-delete": {id: cursor.id, style: {color: cursor.color}}
          //     }
          //   }
          // }
          return item;
        });
        quill.updateContents(op);
        //getDocument(postId);
        // updateUserList();
      }
    })
     //doc op ends // data coming from server as doc as some data.
  
  
    function sendCursorData(range) {
      cursors.localConnection.range = range;
      cursors.update();
      //getDocument(postId);
    }
  
    //
    var debouncedSendCursorData = utils.debounce(function() {
      var range = quill.getSelection();
      if (range) {
        console.log('[cursors] Stopped typing, sending a cursor update/refresh.');
        sendCursorData(range);
      }
    }, 1500);
  
    doc.on('nothing pending', debouncedSendCursorData, ()=>{
      getDocument(postId);
    });

    
  
    //being used but I think code changed
    function updateCursors(source) {
      var activeConnections = {},
        updateAll = Object.keys(cursorsModule.cursors).length == 0;
  
      cursors.connections.forEach(function(connection) {
        if (connection.id != cursors.localConnection.id) {
  
          // Update cursor that sent the update, source (or update all if we're initting)
          if ((connection.id == source.id || updateAll) && connection.range) {
  
            // changed by AMit instead of setCursor starts
            if(cursorsModule.cursors().find(cursor=>cursor.id==connection.id))
            {
            cursorsModule.moveCursor(
              connection.id,
              connection.range
            );
            }else{
                  cursorsModule.createCursor(
            connection.id,
            connection.name,
            connection.color
          );
            } //ends
          }
  
          // Add to active connections hashtable
          activeConnections[connection.id] = connection;
        }
      });
  
      // Clear 'disconnected' cursors
      Object.keys(cursorsModule.cursors).forEach(function(cursorId) {
        if (!activeConnections[cursorId]) {
          cursorsModule.removeCursor(cursorId);
        }
      });
    }
  
    quill.on('selection-change', function(range, oldRange, source) {
      sendCursorData(range);
      if(range != null && range.length > 0 ){
        var text = quill.getText(range.index, range.length);
        comment_range = range;
        console.log('Comment Range', comment_range);
        console.log("User has highlighted: ", text);
      }

    });
  
    //fired from cursor.js when a user is disconnected.
    // so we remove that cursor.
    document.addEventListener('cursors-update', function(e:any) {
      // Handle Removed Connections
       e.detail.removedConnections.forEach(function(connection) {
        if (cursorsModule.cursors[connection.id])
          cursorsModule.removeCursor(connection.id);
      });
  
      updateCursors(e.detail.source);
      // updateUserList();
    });
  
  //   updateCursors(cursors.localConnection);
  // });
  
  
  // window.cursors = cursors;
  
  // var usernameInputEl = document.getElementById('username-input');
  // var usersListEl = document.getElementById('users-list');
  
  // function updateUserList() {
  //   // Wipe the slate clean
  //   usersListEl.innerHTML = null;
  
  //   cursors.connections.forEach(function(connection) {
  //     var userItemEl = document.createElement('li');
  //     var userNameEl = document.createElement('div');
  //     var userDataEl = document.createElement('div');
  
  //     userNameEl.innerHTML = '<strong>' + (connection.name || '(Waiting for username...)') + '</strong>';
  //     userNameEl.classList.add('user-name');
  
  //     if (connection.id == cursors.localConnection.id)
  //       userNameEl.innerHTML += ' (You)';
  
  //     if (connection.range) {
  
  //       if (connection.id == cursors.localConnection.id)
  //         connection.range = quill.getSelection();
  
  //       userDataEl.innerHTML = [
  //         '<div class="user-data">',
  //         '  <div>Index: ' + connection.range.index + '</div>',
  //         '  <div>Length: ' + connection.range.length + '</div>',
  //         '</div>'
  //       ].join('');
  //     } else
  //       userDataEl.innerHTML = '(Not focusing on editor.)';
  
  
  //     userItemEl.appendChild(userNameEl);
  //     userItemEl.appendChild(userDataEl);
  
  //     userItemEl.style.backgroundColor = connection.color;
  //     usersListEl.appendChild(userItemEl);
  //   });
  // }
  
  // usernameInputEl.value = chance.name();
  // usernameInputEl.focus();
  // usernameInputEl.select();
  
  // document.getElementById('username-form').addEventListener('submit', function(event) {
  //   cursors.localConnection.name = usernameInputEl.value;
  //   cursors.update();
  //   quill.enable();  //to be pointed.
  //   document.getElementById('connect-panel').style.display = 'none';
  //   document.getElementById('users-panel').style.display = 'block';
  //   event.preventDefault();
  //   return false;
  // });
  
  // DEBUG
  
  // var sharedbSocketStateEl = document.getElementById('sharedb-socket-state');
  // var sharedbSocketIndicatorEl = document.getElementById('sharedb-socket-indicator');
  
  shareDBConnection.on('state',  function(state, reason) {
    // var indicatorColor;

    if (state === "connected") {
      cursors.localConnection.editorId = shareDBConnection.id;
      cursors.update();
    }
  
    console.log('[sharedb] New connection state: ' + state + ' Reason: ' + reason);
    // sharedbSocketStateEl.innerHTML = state.toString();
  
    // switch (state.toString()) {
    //   case 'connecting':
    //     indicatorColor = 'silver';
    //     break;
    //   case 'connected':
    //     indicatorColor = 'lime';
    //     break;
    //   case 'disconnected':
    //   case 'closed':
    //   case 'stopped':
    //     indicatorColor = 'red';
    //     break;
    // }
  
    // sharedbSocketIndicatorEl.style.backgroundColor = indicatorColor;
  });
  //this.ngxService.stopBackground();
  } 

}

export {comment_range, quill};