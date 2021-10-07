import { Component, OnInit, OnChanges, Output, EventEmitter, Input, Injector } from '@angular/core';

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

// Decalring Current Window Quill to the global instance
(window as any).Quill = Quill;

// Quill Mention
import "quill-mention";

// Quill Image Compress
import ImageCompress from 'quill-image-compress';

// Quill Image Resize
import ImageResize from './quill-image-resize/quill.image-resize.js';

// Image Drop Module
import ImageDrop from './quill-image-drop/quill.image-drop.js';

// Import Quill AutoFormat Module
import Autoformat from '../quill-modules/quill-auto-format';

// Public Functions
import { PublicFunctions } from 'modules/public.functions';

// Import Links
var Link = Quill.import('formats/link');

import QuillClipboard from '../quill-modules/quill-clipboard';

QuillClipboard

Quill.register({
  'modules/imageDrop': ImageDrop,
  'modules/imageResize': ImageResize,
  'modules/imageCompress': ImageCompress,
  // 'modules/clipboard': QuillClipboard,
  // 'modules/autoformat': Autoformat
});

Quill.register('modules/clipboard', QuillClipboard, true)
// Quill.register('modules/autoformat', Autoformat, true)

// Environments
import { environment } from 'src/environments/environment';
import { StorageService } from 'src/shared/services/storage-service/storage.service';

@Component({
  selector: 'app-quill-editor',
  templateUrl: './quill-editor.component.html',
  styleUrls: ['./quill-editor.component.scss']
})
export class QuillEditorComponent implements OnInit, OnChanges {

  constructor(
    private Injector: Injector
  ) {

    // Initialise the modules in constructor
    this.modules = {
      syntax: true,
      toolbar: this.toolbar,
      mention: {},
      history: {
        'delay': 2500,
        'userOnly': true
      },
      // autoformat: true
    }
  }

  // Quill instance variable
  quill: any;

  // Quill modules variable
  modules: any;

  // Uploads url for Files
  filesBaseUrl = environment.UTILITIES_FILES_UPLOADS

  // EditorId variable
  @Input('editorId') editorId: any;

  // ShowToolbar variable
  @Input('toolbar') toolbar = true;

  // ReadOnly Variable
  @Input('readOnly') readOnly = true;

  // Quill Contents Variable
  @Input('contents') contents: any

  // GroupId variable
  @Input('groupId') groupId: any;

  // Output the content present in the editor
  @Output('content') content = new EventEmitter();

  // Public Functions class
  public publicFunctions = new PublicFunctions(this.Injector);

  ngOnChanges() {

    if (this.quill) {
      // Fetch the delta ops from the JSON string
      let delta = (this.isJSON(this.contents))
        ? JSON.parse(this.contents)['ops']
        : this.quill.clipboard.convert(this.contents);

      // Set the content inside quill container
      this.setContents(this.quill, delta);
    }
  }

  ngOnInit() {

    // Set the Status of the toolbar
    this.modules.toolbar = (this.toolbar === false) ? false : this.quillFullToolbar()

    // Set the Mention Module
    this.modules.mention = this.metionModule();

    // Enable Autolinking
    // this.sanitizeLink()

    // If the toolbar is supposed to be visible, then enable following modules
    if (this.toolbar) {

      // Set Image Resize Module
      this.modules.imageResize = this.quillImageResize()

      // Set Image Drop Module
      this.modules.imageDrop = true

      // Set Image Compression Module
      this.modules.imageCompress = this.quillImageCompress()
    }

  }

  ngAfterViewInit() {

    // Initialise quill editor
    this.quill = this.quillEditor(this.modules)

    // Set contents to the quill
    if (this.contents) {
      // Fetch the delta ops from the JSON string
      let delta = (this.isJSON(this.contents))
        ? JSON.parse(this.contents)['ops']
        : this.quill.clipboard.convert(this.contents);

      // Set the content inside quill container
      this.setContents(this.quill, delta);
    }


    // Turn on the quill text change event handler
    this.quillContentChanges(this.quill);
  }

  /**
   * This function is used to check if a function is already strigified
   * @param str
   */
  isJSON(str: string) {
    try {
      JSON.parse(str)
    } catch (e) {
      return false
    }
    return true
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
      ['clean'], ['comment'],['clear']
    ]
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

  /**
   * This function returns the mention module
   */
  metionModule() {

    // Check if groupId is object to take id...
    // In some places in code it is sending object, in other it is sending _id... needs refactoring
    if (typeof this.groupId === 'object' && this.groupId !== null) {
      this.groupId = this.groupId._id;
    }
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
    let storageService = this.Injector.get(StorageService);

    // Fetch the users list from the server
    let filesList: any = await this.publicFunctions.searchFiles(groupId, searchTerm, 'true');

    let googleFilesList: any = [];

    // Fetch Access Token
    if (storageService.existData('googleUser')) {

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

    // Map the users list
    filesList = filesList.map((file: any) => ({
      id: file._id,
      value:
        (file.type == 'folio')
        // Return the Array without duplicates
          ? `<a href="/document/${file._id}?group=${file._group._id}&readOnly=true" style="color: inherit" target="_blank">${file.original_name}</a>`
          : `<a href="${this.filesBaseUrl}/${file.modified_name}?authToken=Bearer ${storageService.getLocalData('authToken')['token']}" style="color: inherit" target="_blank">${file.original_name}</a>`
    }))

    return Array.from(new Set([...filesList, ...googleFilesList]))
  }

  /**
   * This function is responsible for initialising the quill editor
   * @param modules
   * @param {String} theme - 'snow' or 'bubble'
   */
  quillEditor(modules: any, theme?: string) {

    // Return the instance with modules
    return new Quill(`#${this.editorId}`, {
      theme: theme || 'snow',
      modules: modules,
      readOnly: this.readOnly,
      placeholder: (this.readOnly) ? '' : $localize`:@@quillEditor.writeSomethingAwesome:Write something awesome...`
    })
  }

  /**
   * Get quill contents present in the editor
   * @param quill
   */
  getQuillContents(quill: any) {
    return {
      contents: quill.getContents(),
      html: quill.root.innerHTML,
      text: quill.getText()
    }
  }

  /**
   * This function is resposible for detecting the changes in quill contents
   * @param quill
   */
  quillContentChanges(quill: Quill) {
    return quill.on('text-change', (delta, oldDelta, source) => {
      if (source == 'api') {

      } else if (source == 'user') {

        // let driveDivision = document.getElementById('google-drive-file')['innerHTML']

        // let driveDivisionDelta = this.quill.clipboard.convert(driveDivision)

        // Get the quill cotents from the editor
        let quillData: any = this.getQuillContents(quill)

        // Get Quill Contents
        let quillContents = quillData.contents

        // Get Quill HTML
        let quillHTML = quillData.html

        // Get Quill Text
        let quillText = quillData.text

        // quillData.driveDivisionDelta = driveDivisionDelta

        // Set the Mentioned list property
        quillData['mention'] = this.getMentionList(quillContents)

        // Emit the quill data to other components
        this.content.emit(quillData);
      }
    })
  }

  /**
   * This function is responsible for setting the contents in the quill container
   * @param quill
   * @param contents of type Delta
   */
  setContents(quill: Quill, contents: any) {
    quill.setContents(contents);
  }

  /**
   * This function is resposible for fetching the list of the mentions
   * @param content
   */
  getMentionList(content: any) {

    // Create Mention Array
    let mention = content.ops.filter((object) => object.insert.hasOwnProperty('mention'))

    // Return Users and files mentioned
    return {
      users: mention.filter((object) => object.insert.mention.denotationChar === "@"),
      files: mention.filter((object) => object.insert.mention.denotationChar === "#"),
    }
  }

  /**
   * This function is responsible for sanitising the links attached
   */
  sanitizeLink() {
    Link.sanitize = (url) => {
      if (url.indexOf("http") <= -1) {
        url = "https://" + url;
      }
      return url;
    }
  }
}
