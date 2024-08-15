import { Injector, Input, AfterViewInit, Component, ElementRef, ViewChild, LOCALE_ID, Inject, Output, EventEmitter } from '@angular/core';
import { PublicFunctions } from "modules/public.functions";
import { SubSink } from "subsink";
import { UtilityService } from "src/shared/services/utility-service/utility.service";

import Quill from "quill";
import hljs from 'highlight.js'

hljs.configure({
  languages: ['javascript', 'ruby', 'bash', 'cpp', 'cs', 'css', 'dart', 'dockerfile', 'dos', 'excel', 'fortran', 'go', 'java', 'nginx', 'python', 'objectivec', 'yaml', 'yml']
});

@Component({
  selector: "app-folio-comment-editor",
  templateUrl: "./folio-comment-editor.component.html",
  styleUrls: ["./folio-comment-editor.component.scss"],
})
export class FolioCommentEditorComponent implements AfterViewInit {

  @Input() mentionAll = true;
  @Input() userData;
  @Input() groupData;
  @Input() workspaceData;
  @Input() selectedText = '';

  @Output() commentEmitter = new EventEmitter();
  @Output() closeEmitter = new EventEmitter();

  @ViewChild('editable', { static: true }) editable!: ElementRef;

  quillEditor: Quill;
  
  // mentionSubject = new Subject<string>();
  
  // Quill modules variable
  modules: any = {
      toolbar: [
        ['bold', 'italic', 'underline']
      ],
      mention : this.mentionModule()
    };
  
  // SubSink Variable
  subSink = new SubSink();
  
  // Public functions class member
  publicFunctions = new PublicFunctions(this._Injector);
  
  findAFileToTag = $localize`:@@folioEditor.findAFileToTag:find a file to tag`;
  findAPostToTag = $localize`:@@folioEditor.findAPostToTag:find a post to tag`;
  findACollectionToTag = $localize`:@@folioEditor.findACollectionToTag:find a collection to tag`;
  findAPageFromACollectionToTag = $localize`:@@folioEditor.findAPageFromACollectionToTag:find a page from a collection to tag`;
  
  constructor(
    @Inject(LOCALE_ID) public locale: string,
    private _Injector: Injector,
    public utilityService: UtilityService
  ) { }

  async ngAfterViewInit() {
    this.quillEditor = new Quill(this.editable.nativeElement, {
      theme: 'bubble',
      modules: this.modules
    });
  }

  ngOnDestroy() {
    this.subSink.unsubscribe();
  }

  /**
   * This function is resposible for fetching the list of the mentions
   * @param content
   */
  getMentionList(content: any) {
    // Create Mention Array
    let mention = content.content.ops.filter((object) => object.insert.hasOwnProperty('mention'))

    // Return Users and files mentioned
    return {
      users: mention.filter((object) => object.insert.mention.denotationChar === "@"),
      files: mention.filter((object) => object.insert.mention.denotationChar === "#"),
    }
  }

  onContentChanged(content: any) {
    content.mention = this.getMentionList(content)
  }

  onEditorCreated(event) {
    // this.editor!.quillEditor = event;
  }

  //Validates comment content and adds the comment
  async submitComment() {
    // this.commentEmitter.emit(event);
    this.commentEmitter.emit(this.quillEditor);
  }

  mentionModule() {
    // Available commands - the order needs to match the index of cmdSuggestions
    enum Command { file, post, col, colpage }

    return {
      allowedChars: /^[A-Za-z\sÅÄÖåäö0123456789]*$/,
      mentionDenotationChars: ["@", "#"],
      blotName: 'octonius-mention',
      dataAttributes: ['id', 'value', 'denotationChar', 'link', 'target', 'disabled', 'color'],
      selectKeys: ['Enter'],
      //This function is called when a mention has been selected
      onSelect: (item, insertItem) => {
        // // If the item value is a span, User has selected a command
        // if (item.value.split(' ')[0] === '<span') {
        //   let selection = this.editor!.quillEditor.getSelection(true)
        //   let index = selection.index;
          
        //   // Insert the text for the command into the quill
        //   if (item.index == Command.file) {
        //     this.editor!.quillEditor.insertText(index, 'file')
        //   } else if (item.index == Command.post) {
        //     this.editor!.quillEditor.insertText(index, 'post')
        //   } else if (item.index == Command.col) {
        //     this.editor!.quillEditor.insertText(index, 'col')
        //   } else if (item.index == Command.colpage) {
        //     this.editor!.quillEditor.insertText(index, 'colpage')
        //   }
          
        //   // Set the cursor to where the text has been inserted
        //   index += Command[item.index].length
        //   this.editor!.quillEditor.setSelection(index)
        //   this.editor!.quillEditor.focus();

        // // If it is not a command, insert the selected mention item
        // } else {
        //   insertItem(item)
        // }
        insertItem(item);
      },
      source: async (searchTerm, renderList, mentionChar) => {

        // Value of the mention list
        let values: any;
        let searchVal: any;

        // If User types "@" then trigger the list for user mentioning
        if (mentionChar === "@") {
          // Initialise values with list of members
          values = await this.publicFunctions.suggestMembers(searchTerm, this.groupData?._id, this.workspaceData, this.mentionAll);

          // // Adding All Object to mention all the members
          // if (this.mentionAll) {
          //   values.unshift({
          //     id: 'all',
          //     value: 'all'
          //   });
          // }

          this.renderResult(searchVal, values, renderList);

          // this.mentionSubject.next(searchTerm);

          // this.mentionSubject.pipe(
          //   debounceTime(300),
          //   switchMap((val: string) => this.publicFunctions.suggestMembers(val, this.groupData?._id, this.workspaceData, this.mentionAll))
          // ).subscribe(values => this.renderResult(searchTerm, values, renderList));

        // If User types "#" then trigger the list for files mentioning
        } else if (mentionChar === "#") {
          // Initialise values with list of collection pages
          if (searchTerm.slice(0, 8) === 'colpage ') {
            searchVal = searchTerm.split(' ')[1];
            values = await this.publicFunctions.suggestCollectionPages(searchVal, this.groupData?._id, this.workspaceData);
            this.renderResult(searchVal, values, renderList);

            // this.mentionSubject.next(searchVal);

            // this.mentionSubject.pipe(
            //   debounceTime(300),
            //   switchMap((val: string) => this.publicFunctions.suggestCollectionPages(val, this.groupData?._id, this.workspaceData))
            // ).subscribe(values => this.renderResult(searchVal, values, renderList));

          // Initialise values with list of collections
          } else if (searchTerm.slice(0, 4) === 'col ') {
            searchVal = searchTerm.replace('col ', '');
            values = await this.publicFunctions.suggestCollection(this.groupData?._id, searchVal);
            this.renderResult(searchVal, values, renderList);

            // this.mentionSubject.next(searchVal);

            // this.mentionSubject.pipe(
            //   debounceTime(300),
            //   switchMap((val: string) => this.publicFunctions.suggestCollection(this.groupData?._id, val))
            // ).subscribe(values => this.renderResult(searchVal, values, renderList));

          // Initialise values with list of files
          } else if (searchTerm.slice(0, 5) === 'file ') {
            searchVal = searchTerm.replace('file ', '');
            this.publicFunctions.suggestFiles(searchVal, this.groupData?._id, this.workspaceData).then(
              response => {
                values = response;
                this.renderResult(searchVal, values, renderList);
              }
            );

            // this.mentionSubject.next(searchVal);

            // this.mentionSubject.pipe(
            //   debounceTime(300),
            //   switchMap((val: string) => this.publicFunctions.suggestFiles(val, this.groupData?._id, this.workspaceData))
            // ).subscribe(values => this.renderResult(searchVal, values, renderList));
  
          // Initialise values with list of posts
          } else if (searchTerm.slice(0, 5) === 'post ') {
            searchVal = searchTerm.replace('post ', '');
            values = await this.publicFunctions.suggestPosts(searchVal, this.groupData?._id);
            this.renderResult(searchVal, values, renderList);

            // this.mentionSubject.next(searchVal);

            // this.mentionSubject.pipe(
            //   debounceTime(300),
            //   switchMap((val: string) => this.publicFunctions.suggestPosts(val, this.groupData?._id))
            // ).subscribe(values => this.renderResult(searchVal, values, renderList));
            
            // If none of the filters are used, initialise values with all entities
          // } else if (searchTerm.length === 0) {
          } else {
            
            /**
             * The following code triggers a list to display all the assets when no filter has been provided
             */
            searchVal = searchTerm;
            const collections = await this.publicFunctions.suggestCollection(this.groupData?._id, searchVal);
            const collectionPages = await this.publicFunctions.suggestCollectionPages(searchVal, this.groupData?._id, this.workspaceData);
            const files = await this.publicFunctions.suggestFiles(searchTerm, this.groupData?._id, this.workspaceData);
            const posts = await this.publicFunctions.suggestPosts(searchVal, this.groupData?._id);
            values = [...collections, ...collectionPages, ...files, ...posts]
              
            // This is the list of command suggestions that displays when User types "#"
            // let cmdSuggestions = [
            //   // { value: '<span >#file <em>filename</em> <p style="color: #9D9D9D" i18n="@@quillEditor.findAFileToTag"> find a file to tag</p> </span>' },
            //   // { value: '<span >#post <em>posttitle</em> <p style="color: #9D9D9D" i18n="@@quillEditor.findAPostToTag"> find a post to tag </p> </span>' },
            //   // { value: '<span >#col <em>collectionname</em> <p style="color: #9D9D9D" i18n="@@quillEditor.findACollectionToTag"> find a collection to tag </p> </span>' },
            //   // { value: '<span >#colpage <em>collectionpage</em> <p style="color: #9D9D9D" i18n="@@quillEditor.findAPageFromACollectionToTag"> find a page from a collection to tag </p> </span>' },
            //   { value: 'file' },
            //   { value: 'post' },
            //   { value: 'col' },
            //   { value: 'colpage' },
            // ]
            // values = cmdSuggestions;

            this.renderResult(searchVal, values, renderList);
          }
        }
      }
    }
  }

  private renderResult(searchVal, values, renderList) {
    // If searchVal is undefined, then display the list of command suggestions
    if (searchVal === undefined) {
      renderList(values);
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

  //Closes the comment dialog box
  closeComment() {
    this.closeEmitter.emit();
  }
}
