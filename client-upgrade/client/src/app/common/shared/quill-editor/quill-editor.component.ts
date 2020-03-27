import { Component, OnInit, Output, EventEmitter } from '@angular/core';

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

@Component({
  selector: 'app-quill-editor',
  templateUrl: './quill-editor.component.html',
  styleUrls: ['./quill-editor.component.scss']
})
export class QuillEditorComponent implements OnInit {

  constructor() {

    // Initialise the modules in constructor
    this.modules = {
      'syntax': true,
      'toolbar': [
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
  }

  // Quill instance variable
  quill: any;

  // Quill modules variable
  modules: {};

  // Output the content present in the editor
  @Output('content') content = new EventEmitter();

  ngOnInit() {

    // Initialise quill editor
    this.quill = this.quillEditor(this.modules)

    // console.log(myToolTip)
    console.log('Quill Editor', this.quill)
  }

  ngAfterViewInit(){

    // Turn on the quill text change event handler
    this.quillContentChanges(this.quill)
  }

  /**
   * This function is responsible for initialising the quill editor
   * @param modules 
   */
  quillEditor(modules: Object) {

    // Create Quill Instance locally
    let quill: Quill 

    // Return the instance with modules
    return quill = new Quill('#editor', {
      theme: 'snow',
      modules: modules,
      placeholder: 'Start typing here...'
    })
  }

  /**
   * Get quill contents present in the editor
   * @param quill 
   */
  getQuillContents(quill: any){
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
  quillContentChanges(quill: Quill){
    return quill.on('text-change', (delta, oldDelta, source) => {
      if (source == 'api') {
        console.log("An API call triggered this change.");
      } else if (source == 'user') {

        // Get the quill cotents from the editor
        let quillData = this.getQuillContents(quill)

        // Get Quill Contents
        let quillContents = quillData.contents

        // Get Quill HTML
        let quillHTML = quillData.html

        // Get Quill Text
        let quillText = quillData.text

        // Emit the quill data to other components
        this.content.emit(quillData);
      }
    })
  }
}
