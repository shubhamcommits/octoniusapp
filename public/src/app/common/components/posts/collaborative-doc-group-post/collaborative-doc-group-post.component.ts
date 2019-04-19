import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Route } from '@angular/router';
import {Location} from '@angular/common';

import QuillCursors from 'quill-cursors';
import ReconnectingWebSocket from 'reconnecting-websocket';
import * as ShareDB from '../../../../../../../node_modules/sharedb/lib/client';
import {cursors} from '../../../../shared/utils/cursors';
import * as utils from '../../../../shared/utils/utils';

@Component({
  selector: 'app-collaborative-doc-group-post',
  templateUrl: './collaborative-doc-group-post.component.html',
  styleUrls: ['./collaborative-doc-group-post.component.scss']
})
export class CollaborativeDocGroupPostComponent implements OnInit {

 toolbarOptions = [
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
  
    ['clean']                                         // remove formatting button
  ];

  postId: any;
  groupId: any;

  documentContent= "Test";

  constructor(
    private router: Router,
    private _activatedRoute: ActivatedRoute,
    private _location: Location) {
      this.postId = this._activatedRoute.snapshot.paramMap.get('postId');
      this.groupId = this._activatedRoute.snapshot.paramMap.get('id');
     }

  ngOnInit() {
    this.initializeQuillEditor();
  }

  backClicked() {
    this._location.back();
  }

  initializeQuillEditor():void {

    ShareDB.types.register(require('rich-text').type);
  
    Quill.register('modules/cursors', QuillCursors);
  
    var shareDBSocket = new ReconnectingWebSocket(((location.protocol === 'https:') ? 'wss' : 'ws') + '://' + 'localhost:3001' + '/sharedb');
  
    var shareDBConnection = new ShareDB.Connection(shareDBSocket);
    
    var quill = new Quill('#editor', {
      theme: 'snow',
      modules: {
        toolbar: this.toolbarOptions,
        cursors:true
        // cursors: {
        //    autoRegisterListener: false
        // },
      },
    });
  
    // here foobar should be the groupd id or in case of multiple docs.
    // different logic to be developed.
    // groupd id. activated route.
    var doc = shareDBConnection.get('documents', this.postId);
  
    var cursorsModule = quill.getModule('cursors');
    // I think this function is deprecated/removed from the latest code on repo.
    // cursorsModule.registerTextChangeListener(); // now private
  
  doc.subscribe(function(err) {
  
    if (err) throw err;
  
    if (!doc.type)
      doc.create([{
        insert: '\n'
      }], 'rich-text');
  
    // update editor contents
    quill.setContents(doc.data);
  
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
        quill.updateContents(op);
        // updateUserList();
      }
    }); //doc op ends // data coming from server as doc as some data.
  
  
    function sendCursorData(range) {
      cursors.localConnection.range = range;
      cursors.update();
    }
  
    //
    var debouncedSendCursorData = utils.debounce(function() {
      var range = quill.getSelection();
      if (range) {
        console.log('[cursors] Stopped typing, sending a cursor update/refresh.');
        sendCursorData(range);
      }
    }, 1500);
  
    doc.on('nothing pending', debouncedSendCursorData);
  
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
  
  shareDBConnection.on('state', function(state, reason) {
    // var indicatorColor;
  
    console.log('[sharedb] New connection state: ' + state + ' Reason: ' + reason);

    console.log('Quill content', quill.getText());
  
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
  
  } 

}
