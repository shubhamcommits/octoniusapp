import { Component, OnInit, Output, EventEmitter, Input, Injector } from '@angular/core';

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

// Quill Mention
import "quill-mention";

// Public Functions
import { PublicFunctions } from 'src/app/dashboard/public.functions';

@Component({
  selector: 'app-quill-editor',
  templateUrl: './quill-editor.component.html',
  styleUrls: ['./quill-editor.component.scss']
})
export class QuillEditorComponent implements OnInit {

  constructor(
    private Injector: Injector
  ) {

    // Initialise the modules in constructor
    this.modules = {
      syntax: true,
      toolbar: this.toolbar,
      mention: { }
    }
  }

  // Quill instance variable
  quill: any;

  // Quill modules variable
  modules: any;

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

  ngOnInit() {

    // Set the Status of the toolbar
    this.modules.toolbar = (this.toolbar === false) ? false : this.quillFullToolbar()

    // Set the Mention Module
    this.modules.mention = this.metionModule();

  }

  ngAfterViewInit() {

    // Initialise quill editor
    this.quill = this.quillEditor(this.modules)

    // Set contents to the quill
    if(this.contents){
     
     // Fetch the delta ops from the JSON string 
     let delta = JSON.parse(this.contents)['ops']

      // Set the content inside quill container  
      this.setContents(this.quill, delta)
    }

    // console.log('Quill Editor', this.quill, 'Quill Contents', this.getQuillContents(this.quill))

    // Turn on the quill text change event handler
    this.quillContentChanges(this.quill)
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
          values = await this.suggestMembers(this.groupId, searchTerm);

        // If User types "#" then trigger the list for files mentioning
        } else if(mentionChar === "#") {

          // Initialise values with list of files
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
  async suggestMembers(groupId: string, searchTerm: string){
    
    // Fetch the users list from the server
    let usersList: any = await this.publicFunctions.searchGroupMembers(groupId, searchTerm);
    // Map the users list
    usersList = usersList['users'].map((user) => ({
      id: user._id,
      value: user.first_name + " " +user.last_name
    }))
    // Return the Array without duplicates
    return Array.from(new Set(usersList))
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
      theme: 'snow',
      modules: modules,
      readOnly: this.readOnly,
      placeholder: (this.readOnly) ? '' : 'Start typing here...'
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
        console.log("An API call triggered this change.");
      } else if (source == 'user') {

        // Get the quill cotents from the editor
        let quillData = this.getQuillContents(quill)
        console.log(quillData);

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

  /**
   * This function is responsible for setting the contents in the quill container
   * @param quill 
   * @param contents of type Delta 
   */
  setContents(quill: Quill, contents: any){
    quill.setContents(contents)
  }
}
