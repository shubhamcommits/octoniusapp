import { Component, OnInit, Input } from '@angular/core';

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

@Component({
  selector: 'app-folio-editor',
  templateUrl: './folio-editor.component.html',
  styleUrls: ['./folio-editor.component.scss']
})
export class FolioEditorComponent implements OnInit {

  constructor() {

    // Initialise the modules in constructor
    this.modules = {
      syntax: true,
      toolbar: this.toolbar,
      cursors: {
        hideDelayMs: 5000,
        hideSpeedMs: 0,
        transformOnTextChange: true
      }
    }
  }

  // EditorId variable
  @Input('editorId') editorId: any = 'normal-editor';

  // ShowToolbar variable
  @Input('toolbar') toolbar = true;

  // Quill instance variable
  quill: any;

  // Quill modules variable
  modules: any;

  ngOnInit() {
  }

  ngAfterViewInit() {

    // Set the Status of the toolbar
    this.modules.toolbar = (this.toolbar === false) ? false : this.quillFullToolbar()

    // Initialise quill editor
    this.quill = this.quillEditor(this.modules)

    let cursor = this.createCursor(this.quill)

    console.log(cursor)

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

  createCursor(quill: Quill){

    // Get the Cursor Module
    let cursorModule = quill.getModule('cursors')

    return cursorModule.createCursor('cursor', 'User 2', 'blue');

  }

}
