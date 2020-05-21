import { Component, OnInit, Input, Injector } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

// Public Functions
import { PublicFunctions } from 'src/app/dashboard/public.functions';

// Reconnecting WebSockets
import ReconnectingWebSocket from 'reconnecting-websocket'

// ShareDB Client
import * as ShareDB from 'sharedb/lib/client'

// Register the Types of the Sharedb
ShareDB.types.register(require('rich-text').type);

// Environment Variables
import { environment } from 'src/environments/environment';

// Highlight.js 
import * as hljs from 'highlight.js';

// Highlight.js sublime css
import 'highlight.js/styles/monokai-sublime.css';

// Configure hljs for languages
hljs.configure({
  languages: ['javascript', 'ruby', 'bash', 'cpp', 'cs', 'css', 'dart', 'dockerfile', 'dos', 'excel', 'fortran', 'go', 'java', 'nginx', 'python', 'objectivec', 'yaml', 'yml']
});

// Quill Import
import Quill from 'quill';

// Import Quill Cursors
import QuillCursors from 'quill-cursors';

// Register Quill Cursor Module
Quill.register('modules/cursors', QuillCursors);

// Subsink Class
import { SubSink } from 'subsink';


@Component({
  selector: 'app-folio-editor',
  templateUrl: './folio-editor.component.html',
  styleUrls: ['./folio-editor.component.scss']
})
export class FolioEditorComponent implements OnInit {

  constructor(
    private _Injector: Injector,
    private _ActivatedRoute: ActivatedRoute
  ) {

    // Initialise the modules in constructor
    this.modules = {
      syntax: true,
      toolbar: this.toolbar,
      cursors: {
        hideDelayMs: 5000,
        hideSpeedMs: 0,
        transformOnTextChange: true,
        autoRegisterListener: false
      },
      history: {
        userOnly: true
      }
    }
  }

  // EditorId variable
  @Input('editorId') editorId: any = 'normal-editor'

  // ShowToolbar variable
  @Input('toolbar') toolbar = true

  // Quill instance variable
  quill: any

  // Quill modules variable
  modules: any

  // Public functions class member
  publicFunctions = new PublicFunctions(this._Injector)

  // User Data Variable
  userData: any

  // ShareDB Variable
  shareDBSocket: any

  // Websocket Options
  webSocketOptions = {
    WebSocket: undefined,
    maxReconnectionDelay: 10000,
    minReconnectionDelay: 1000 + Math.random() * 4000,
    reconnectionDelayGrowFactor: 1.3,
    minUptime: 5000,
    connectionTimeout: 4000,
    maxRetries: Infinity,
    debug: false,
  }

  // Folio Variable
  folio: any

  // Folio ID Variable
  folioId = this._ActivatedRoute.snapshot.paramMap.get('id')

  // SubSink Variable
  subSink = new SubSink();

  ngOnInit() {

    // Initialise the connection for folio
    this.folio = this.initializeConnection()
  }

  async ngAfterViewInit() {

    // Fetch User Data
    this.userData = await this.publicFunctions.getCurrentUser()

    // Set the Status of the toolbar
    this.modules.toolbar = (this.toolbar === false) ? false : this.quillFullToolbar()

    // Initialise quill editor
    this.quill = this.quillEditor(this.modules)

    // Create the Cursor
    let cursor = this.createCursor(this.quill, this.userData)

    // this.folio = new ShareDB.doc

    this.initializeFolio(this.folio, this.quill)

  }

  /**
   * This fuction is responsible for initialising the connection to sharedb backend
   */
  initializeConnection() {

    // Connect with the Socket Backend
    this.shareDBSocket = new ReconnectingWebSocket(environment.FOLIO_BASE_URL + '/folio', [], this.webSocketOptions)

    // Initialise the Realtime DB Connection 
    let shareDBConnection = new ShareDB.Connection(this.shareDBSocket)

    // Return the Document with the respective folioId
    return shareDBConnection.get('documents', this.folioId);  
  }

  /**
   * This function is responsible for initialising the quill editor
   * @param modules 
   */
  quillEditor(modules: Object) {

    // Create Quill Instance locally
    let quill: Quill

    // Return the instance with modules
    return quill = new Quill(`#${this.editorId}`, {
      theme: 'bubble',
      modules: modules,
      placeholder: 'Start typing here...'
    })
  }

  /**
   * This function return the full toolbar for quilleditor
   */
  quillFullToolbar() {
    return [
      [{ 'font': [] }, { 'size': [] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'super' }, { 'script': 'sub' }],
      [{ 'header': '1' }, { 'header': '2' }, 'blockquote', 'code-block'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['direction', { 'align': [] }],
      ['link', 'image', 'video', 'formula'],
      ['clean']
    ]
  }

  /**
   * This function is responsible for creating the cursor
   * @param quill 
   * @param user 
   */
  createCursor(quill: Quill, user: any) {

    // Get the Cursor Module
    let cursorModule = quill.getModule('cursors')

    // Return Cursor Name
    return cursorModule.createCursor(user._id, user.full_name, 'blue');

  }

  /**
   * This function is responsible for fetching the folio
   * @param folio 
   */
  initializeFolio(folio: any, quill: Quill) {

    console.log(folio, quill)

    // Subscribe to the folio data and update the quill instance with the data
    folio.subscribe(async () =>{

      if (!folio.type)
        folio.create([{
          insert: '\n'
        }], 'rich-text');
    
      // update editor contents
      quill.setContents(folio.data)

    })
  }

  handleFolio(folio: any, user: any, quill: Quill) {

    // local -> server
    quill.on('text-change', (delta: any, oldDelta, source) => {
      if (source == 'user') {
        var formattingDelta = delta.reduce(function (check, op) {
          return (op.insert || op.delete) ? false : check;
        }, true);

        // If it's not a formatting-only delta, collapse local selection
        delta.userId = user._id;

        folio.submitOp(delta, {
          source: this.quill
        }, (err: any) => {
          if (err)
            console.error('Submit OP returned an error:', err);
        });
      }
      else if (source == 'api') {
        // console.log("An API action triggered this change.");
      }
    })

    // server -> local
    folio.on('op', function (op, source) {
      if (source !== this.quill) {
        this.quill.updateContents(op);
      }
    })
  }


  /**
   * This function is responsible for closing the socket on destroying the component
   */
  ngOnDestroy() {
    this.subSink.unsubscribe();
    this.shareDBSocket.close();
  }

}
