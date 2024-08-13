import { Component, OnInit, Output, EventEmitter, Input, Injector, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PublicFunctions } from 'modules/public.functions';
import { environment } from 'src/environments/environment';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { debounceTime, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { QuillEditorComponent } from 'ngx-quill'
import Quill from "quill";
import { Mention } from "quill-mention";
import { OctoniusMentionBlot } from '../quill-modules/quill-mention-blot';
import ImageResizor from 'quill-image-resizor'
import hljs from 'highlight.js'

Quill.register({
  "blots/mention": OctoniusMentionBlot,
  "modules/mention": Mention
});
Quill.register('modules/imageResizor', ImageResizor)

hljs.configure({
  languages: ['javascript', 'ruby', 'bash', 'cpp', 'cs', 'css', 'dart', 'dockerfile', 'dos', 'excel', 'fortran', 'go', 'java', 'nginx', 'python', 'objectivec', 'yaml', 'yml']
});

@Component({
  selector: 'app-quill-editor',
  templateUrl: './quill-editor.component.html',
  styleUrls: ['./quill-editor.component.scss']
})
export class OctoQuillEditorComponent implements OnInit {

  @Input() editorId: any;
  @Input() toolbar = true;
  @Input() readOnly = true;
  @Input() quillContent: any
  @Input() groupId: any;
  @Input() workspaceId: any;
  @Input() theme = 'snow';
  @Input() mentionAll = true;
  @Input() workspaceData: any;

  @ViewChild(QuillEditorComponent, { static: true }) editor: QuillEditorComponent;

  // Output the content present in the editor
  @Output() contentEmitter = new EventEmitter();

  modules: any = {
    syntax: { hljs },
    mention: {
      allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
      mentionDenotationChars: ["@", "#"],
      blotName: 'octonius-mention',
      dataAttributes: ['id', 'value', 'denotationChar', 'link', 'target', 'disabled', 'color'],
      onSelect: (item: any, insertItem: any) => {
console.log(item);
console.log(this.editor);
        // enum Command { file, post, col, colpage };

        // If the item value is a span, User has selected a command
        // if (item.value.split(' ')[0] === '<span') {
        // if (item.denotationChar === '#') {
        //   // let selection = this.editor!.quillEditor.getSelection(true)
        //   // let index = selection.index;
        //   let index = item.index;
          
        //   // Insert the text for the command into the quill
        //   if (index == Command.file) {
        //     this.editor!.quillEditor.insertText(index, 'file')
        //   } else if (index == Command.post) {
        //     this.editor!.quillEditor.insertText(index, 'post')
        //   } else if (index == Command.col) {
        //     this.editor!.quillEditor.insertText(index, 'col')
        //   } else if (index == Command.colpage) {
        //     this.editor!.quillEditor.insertText(index, 'colpage')
        //   }
          
        //   // Set the cursor to where the text has been inserted
        //   index += Command[item.index].length
        //   this.editor!.quillEditor.setSelection(index)
        //   this.editor!.quillEditor.focus();

        // // If it is not a command, insert the selected mention item
        // } else {
        //  insertItem(item);
        // }
        insertItem(item);
      },
      source: async (searchTerm: any, renderList: any, mentionChar: any) => {
        // Value of the mention list
        let values: any;
        let searchVal: any;

        // If User types "@" then trigger the list for user mentioning
        if (mentionChar === "@") {
          // Initialise values with list of members
          values = await this.publicFunctions.suggestMembers(searchTerm, this.groupId, this.workspaceData, this.mentionAll);

          // Adding All Object to mention all the members
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
          //   switchMap((val: string) => this.publicFunctions.suggestMembers(val, this.groupId, this.workspaceData, this.mentionAll))
          // ).subscribe(values => this.renderResult(searchTerm, values, renderList));

        // If User types "#" then trigger the list for files mentioning
        } else if (mentionChar === "#") {
          // Initialise values with list of collection pages
          if (searchTerm.slice(0, 8) === 'colpage ') {
            searchVal = searchTerm.split(' ')[1];
            values = await this.publicFunctions.suggestCollectionPages(searchVal, this.groupId, this.workspaceData);

            this.renderResult(searchVal, values, renderList);

            // this.mentionSubject.next(searchVal);

            // this.mentionSubject.pipe(
            //   debounceTime(300),
            //   switchMap((val: string) => this.publicFunctions.suggestCollectionPages(val, this.groupId, this.workspaceData))
            // ).subscribe(values => this.renderResult(searchVal, values, renderList));

          // Initialise values with list of collections
          } else if (searchTerm.slice(0, 4) === 'col ') {
            searchVal = searchTerm.replace('col ', '');
            values = await this.publicFunctions.suggestCollection(this.groupId, searchVal);

            this.renderResult(searchVal, values, renderList);

            // this.mentionSubject.next(searchVal);

            // this.mentionSubject.pipe(
            //   debounceTime(300),
            //   switchMap((val: string) => this.publicFunctions.suggestCollection(this.groupId, val))
            // ).subscribe(values => this.renderResult(searchVal, values, renderList));

          // Initialise values with list of files
          } else if (searchTerm.slice(0, 5) === 'file ') {
            searchVal = searchTerm.replace('file ', '');
            this.publicFunctions.suggestFiles(searchVal, this.groupId, this.workspaceData).then(
              response => {
                values = response;

                this.renderResult(searchVal, values, renderList);
              }
            );

            // this.mentionSubject.next(searchVal);

            // this.mentionSubject.pipe(
            //   debounceTime(300),
            //   switchMap((val: string) => this.publicFunctions.suggestFiles(val, this.groupId, this.workspaceData))
            // ).subscribe(values => this.renderResult(searchVal, values, renderList));
  
          // Initialise values with list of posts
          } else if (searchTerm.slice(0, 5) === 'post ') {
            searchVal = searchTerm.replace('post ', '');
            values = await this.publicFunctions.suggestPosts(searchVal, this.groupId);

            this.renderResult(searchVal, values, renderList);

            // this.mentionSubject.next(searchVal);

            // this.mentionSubject.pipe(
            //   debounceTime(300),
            //   switchMap((val: string) => this.publicFunctions.suggestPosts(val, this.groupId))
            // ).subscribe(values => this.renderResult(searchVal, values, renderList));
            
            // If none of the filters are used, initialise values with all entities
          // } else if (searchTerm.length === 0) {
          } else {
            /**
             * The following code triggers a list to display all the assets when no filter has been provided
             */
            searchVal = searchTerm;
            const collections = await this.publicFunctions.suggestCollection(this.groupId, searchVal);
            const collectionPages = await this.publicFunctions.suggestCollectionPages(searchVal, this.groupId, this.workspaceData);
            const files = await this.publicFunctions.suggestFiles(searchTerm, this.groupId, this.workspaceData);
            const posts = await this.publicFunctions.suggestPosts(searchVal, this.groupId);
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
    },
    imageResizor: {},
    toolbar: (this.toolbar) ? this.quillFullToolbar() : false
  };

  // mentionSubject = new Subject<string>();

  // Uploads url for Files
  filesBaseUrl = environment.UTILITIES_BASE_API_URL;

  findAFileToTag = $localize`:@@quillEditor.findAFileToTag:find a file to tag`;
  findAPostToTag = $localize`:@@quillEditor.findAPostToTag:find a post to tag`;
  findACollectionToTag = $localize`:@@quillEditor.findACollectionToTag:find a collection to tag`;
  findAPageFromACollectionToTag = $localize`:@@quillEditor.findAPageFromACollectionToTag:find a page from a collection to tag`;
  
  // Public Functions class
  public publicFunctions = new PublicFunctions(this.Injector);

  constructor(
    private utilityService: UtilityService,
    private Injector: Injector
  ) { }

  async ngOnInit() {
    if (!this.utilityService.objectExists(this.workspaceData)) {
      this.workspaceData = await this.publicFunctions.getCurrentWorkspace();
    }
    // this.initQuillModules();

    this.quillContent = (this.utilityService.isJSON(this.quillContent)) ? this.publicFunctions.convertQuillToHTMLContent(JSON.parse(this.quillContent)['ops']) : this.quillContent;
  }

  // ngAfterViewInit() {
  //   // Set contents to the quill
  //   if (this.contents) {
  //     Fetch the delta ops from the JSON string
  //     let delta = (this.utilityService.isJSON(this.contents))
  //       ? JSON.parse(this.contents)['ops']
  //       : this.quill.clipboard.convert(this.contents);

  //     // Set the content inside quill container
  //     this.setContents(delta);
  //   }


  //   // Turn on the quill text change event handler
  //   this.quillContentChanges(this.quill);
  // }

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
  // quillImageCompress() {
  //   return {
  //     quality: 0.9,
  //     maxWidth: 1000,
  //     maxHeight: 1000,
  //     imageType: 'image/jpeg'
  //   }
  // }

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
  // quillContentChanges(quill: Quill) {
  //   return quill.on('text-change', (delta, oldDelta, source) => {
  //     if (source == 'api') {

  //     } else if (source == 'user') {

  //       // let driveDivision = document.getElementById('google-drive-file')['innerHTML']

  //       // let driveDivisionDelta = this.quill.clipboard.convert(driveDivision)

  //       // Get the quill cotents from the editor
  //       let quillData: any = this.getQuillContents(quill)

  //       // Get Quill Contents
  //       // let quillContents = quillData.contents;
  //       let quillContents = this.quillContent;

  //       // Get Quill HTML
  //       let quillHTML = quillData.html;

  //       // Get Quill Text
  //       let quillText = quillData.text;

  //       // quillData.driveDivisionDelta = driveDivisionDelta

  //       // Set the Mentioned list property
  //       quillData['mention'] = this.getMentionList(quillContents)

  //       // Emit the quill data to other components
  //       this.contentEmitter.emit(quillData);
  //     }
  //   })
  // }

  /**
   * This function is responsible for setting the contents in the quill container
   * @param quill
   * @param contents of type Delta
   */
  // setContents(quill: Quill, contents: any) {
  //   quill?.setContents(contents);
  // }

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

  /**
   * This function is responsible for sanitising the links attached
   */
  // sanitizeLink() {
  //   Link.sanitize = (url) => {
  //     if (url.indexOf("http") <= -1) {
  //       url = "https://" + url;
  //     }
  //     return url;
  //   }
  // }

  onContentChanged(content: any) {
    content.mention = this.getMentionList(content)
    this.contentEmitter.emit(content);
  }

  onEditorCreated(event) {
    // this.editor!.quillEditor = event;
  }
}