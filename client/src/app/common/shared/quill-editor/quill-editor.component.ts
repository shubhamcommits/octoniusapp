import { Component, OnInit, OnChanges, Output, EventEmitter, Input, Injector, AfterViewInit } from '@angular/core';

// Highlight.js
import hljs from 'highlight.js';

// Highlight.js sublime css
//import 'highlight.js/styles/monokai-sublime.css';

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
// import ImageResize from './quill-image-resize/quill.image-resize.js';
import ImageResize from 'src/shared/utilities/quill-image-resize/ImageResize.js';

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
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-quill-editor',
  templateUrl: './quill-editor.component.html',
  styleUrls: ['./quill-editor.component.scss']
})
export class QuillEditorComponent implements OnInit, OnChanges, AfterViewInit {

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
  @Input() workspaceId: any;
  @Input() theme = 'snow';
  @Input() mentionAll = true;
  @Input() workspaceData: any;

  // Output the content present in the editor
  @Output('content') content = new EventEmitter();

  // Quill instance variable
  quill: any;

  // Quill modules variable
  modules: any;

  // Uploads url for Files
  filesBaseUrl = environment.UTILITIES_BASE_API_URL;

  // Public Functions class
  public publicFunctions = new PublicFunctions(this.Injector);

  constructor(
    private utilityService: UtilityService,
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

  async ngOnInit() {

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

    if (!this.utilityService.objectExists(this.workspaceData)) {
      this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
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
      ['link', 'image', 'video', 'formula']
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

    if (typeof this.workspaceId === 'object' && this.workspaceId !== null) {
      this.workspaceId = this.workspaceId._id;
    }

    return {
      allowedChars: /^[A-Za-z\sÅÄÖåäö0123456789]*$/,
      mentionDenotationChars: ["@", "#"],
      source: async (searchTerm, renderList, mentionChar) => {

        // Value of the mention list
        let values: any;
        let searchVal: any;

        // If User types "@" then trigger the list for user mentioning
        if (mentionChar === "@") {
          // Initialise values with list of members
          values = await this.publicFunctions.suggestMembers(searchTerm, this.groupId, this.workspaceData);

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
            values = await this.publicFunctions.suggestCollectionPages(searchVal, this.groupId, this.workspaceData);  

          // Initialise values with list of collections
          } else if (searchTerm.slice(0, 4) === 'col ') {
            searchVal = searchTerm.replace('col ', '');
            values = await this.publicFunctions.suggestCollection(this.groupId, searchVal);

          // Initialise values with list of files
          } else if (searchTerm.slice(0, 5) === 'file ') {
            searchVal = searchTerm.replace('file ', '');
            values = await this.publicFunctions.suggestFiles(searchVal, this.groupId, this.workspaceData);

          // Initialise values with list of posts
          } else if (searchTerm.slice(0, 5) === 'post ') {
            searchVal = searchTerm.replace('post ', '');
            values = await this.publicFunctions.suggestPosts(searchVal, this.groupId);

          // If none of the filters are used, initialise values with all entities
          } else {
            searchVal = searchTerm;
            const collections = await this.publicFunctions.suggestCollection(this.groupId, searchVal);
            const collectionPages = await this.publicFunctions.suggestCollectionPages(searchVal, this.groupId, this.workspaceData);  
            const files = await this.publicFunctions.suggestFiles(searchTerm, this.groupId, this.workspaceData);
            const posts = await this.publicFunctions.suggestPosts(searchVal, this.groupId);
            
            values = [...collections, ...collectionPages, ...files, ...posts]
          }
        }

        // If searchVal is undefined, then show the full list
        if (searchVal === undefined) {
          renderList(values, searchTerm);
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
   * This function is responsible for initialising the quill editor
   * @param modules
   * @param {String} theme - 'snow' or 'bubble'
   */
  quillEditor(modules: any) {
    // Return the instance with modules
    return new Quill(`#${this.editorId}`, {
      theme: this.theme || 'snow',
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
    quill?.setContents(contents);
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
