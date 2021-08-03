import { Component, OnInit, Input, Injector, OnDestroy, AfterViewInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

// Public Functions
import { PublicFunctions } from 'modules/public.functions';

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

// Imporrt Quill Autoformat module
import Autoformat from 'src/app/common/shared/quill-modules/quill-auto-format';

// Register Quill Modules
Quill.register({
  'modules/cursors': QuillCursors,
  'modules/autoformat': Autoformat
});

// Subsink Class
import { SubSink } from 'subsink';

// Import Quill Editor Component
import { QuillEditorComponent } from 'src/app/common/shared/quill-editor/quill-editor.component';
import { FilesService } from 'src/shared/services/files-service/files.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';

@Component({
  selector: 'app-folio-editor',
  templateUrl: './folio-editor.component.html',
  styleUrls: ['./folio-editor.component.scss']
})
export class FolioEditorComponent implements OnInit, AfterViewInit, OnDestroy {

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
    // WebSocket: undefined,
    // maxReconnectionDelay: 10000,
    // minReconnectionDelay: 1000 + Math.random() * 4000,
    // reconnectionDelayGrowFactor: 1.3,
    // minUptime: 5000,
    // connectionTimeout: 4000,
    // maxRetries: Infinity,
    // debug: false,
    //startClosed: false
  }

  // Folio Variable
  folio: any

  // Folio ID Variable
  folioId = this._ActivatedRoute.snapshot.paramMap.get('id')

  // GroupId variable
  groupId = this._ActivatedRoute.snapshot.queryParamMap.get('group');

  // Read Only State of the folio
  readOnly = true

  // SubSink Variable
  subSink = new SubSink()

  // Create new Object of quillEditorComponent
  quillEditorComponent = new QuillEditorComponent(this._Injector)

  // Uploads url for Files
  filesBaseUrl = environment.UTILITIES_FILES_UPLOADS;

  constructor(
    private _Injector: Injector,
    private _ActivatedRoute: ActivatedRoute
  ) {

    // Get the State of the ReadOnly
    this.readOnly = this._ActivatedRoute.snapshot.queryParamMap.get('readOnly') == 'true' || false

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
        delay: 2500,
        userOnly: true
      },
      autoformat: true,
      mention: {}
    }
  }

  async ngOnInit() {

    // Initialise the connection for folio
    this.folio = this.initializeConnection()

    // If the toolbar is supposed to be visible, then enable following modules
    if (this.toolbar) {

      // Set Image Resize Module
      this.modules.imageResize = this.quillEditorComponent.quillImageResize()

      // Set Image Drop Module
      this.modules.imageDrop = true

      // Set Image Compression Module
      this.modules.imageCompress = this.quillEditorComponent.quillImageCompress()
    }

    // Set the White as the background color for quill
    // document.body.style.setProperty('background', '#ffffff', 'important')
  }

  async ngAfterViewInit() {

    // Fetch User Data
    if(!this.readOnly) {
      this.userData = await this.publicFunctions.getCurrentUser()

      // check if the user is part of the group of the folio
      const groupIndex = await this.userData?._groups?.findIndex(group => { return (group._id || group) == this.groupId });
      this.readOnly = this.readOnly || (groupIndex < 0);
    }

    // Set the Status of the toolbar
    this.modules.toolbar = (this.toolbar === false) ? false : this.quillEditorComponent.quillFullToolbar()

    // Set the Mention Module
    this.modules.mention = this.metionModule();

    // Initialise quill editor
    this.quill = this.quillEditor(this.modules)

    // Create the Cursor
    if(!this.readOnly)
      var cursor = this.createCursor(this.quill, this.userData);

    //
    this.initializeFolio(this.folio, this.quill)

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
    this.shareDBSocket = new ReconnectingWebSocket(environment.FOLIO_BASE_URL + '/editor', [], this.webSocketOptions)

    // Initialise the Realtime DB Connection
    let shareDBConnection = new ShareDB.Connection(this.shareDBSocket);

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
      readOnly: this.readOnly,
      placeholder: $localize`:@@folioEditor.writeSomethingAwesome:Write something awesome...`
    })
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

    // Subscribe to the folio data and update the quill instance with the data
    folio.subscribe(async () => {

      if (!folio.type)
        folio.create([{
          insert: '\n'
        }], 'rich-text');

      // update editor contents
      quill.setContents(folio.data)

      // local -> server
      quill.on('text-change', (delta, oldDelta, source) => {

        if(delta.ops.length > 1 && delta.ops[1].insert) {
          let mentionMap = JSON.parse(JSON.stringify(delta.ops[1].insert));
          if (mentionMap.mention && mentionMap.mention.denotationChar === '@') {
            let filesService = this._Injector.get(FilesService);
            filesService.newFolioMention(mentionMap.mention, this.folioId, this.userData._id)
              .then(res => res.subscribe(result => console.log(result)));
          }
        }


        if (source == 'user') {

          folio.submitOp(delta, {
            source: quill
          }, (err: Error) => {
            if (err)
              console.error('Submit OP returned an error:', err);
          });

        }
      });

      // server -> local
      folio.on('op', (op, source) => {
        if (source === quill) return;
        quill.updateContents(op);
      });

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
          values = await this.suggestMembers(this.groupId, searchTerm)

          // Adding All Object to mention all the members
          values.unshift({
            id: 'all',
            value: 'all'
          })

          // If User types "#" then trigger the list for files mentioning
        } else if (mentionChar === "#") {

          // Initialise values with list of files
          values = await this.suggestFiles(this.groupId, searchTerm)
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
      }
    }
  }

  /**
   * This function is responsible for fetching the group members list
   * @param groupId
   * @param searchTerm
   */
  async suggestMembers(groupId: string, searchTerm: string) {

    // Fetch the users list from the server
    let usersList: any = await this.publicFunctions.searchGroupMembers(groupId, searchTerm)

    // Map the users list
    usersList = usersList['users'].map((user) => ({
      id: user._id,
      value: user.first_name + " " + user.last_name
    }))

    // Return the Array without duplicates
    return Array.from(new Set(usersList))
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
    let filesList: any = await this.publicFunctions.searchFiles(groupId, searchTerm, 'true');

    // Map the users list
    filesList = filesList.map((file: any) => ({
      id: file._id,
      value:
        (file.type == 'folio')
          ? `<a href="/document/${file._id}?group=${file._group._id}&readOnly=true" style="color: inherit" target="_blank">${file.original_name}</a>`
          : `<a href="${this.filesBaseUrl}/${file.modified_name}?authToken=Bearer ${storageService.getLocalData('authToken')['token']}" style="color: inherit" target="_blank">${file.original_name}</a>`
    }))

    // Return the Array without duplicates
    return Array.from(new Set(filesList))
  }
}
