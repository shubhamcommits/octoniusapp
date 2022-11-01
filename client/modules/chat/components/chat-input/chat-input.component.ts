import { Component, OnInit, Output, EventEmitter, Injector, Input, ViewChild } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { cleanText } from 'pdf-lib';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';


@Component({
  selector: 'app-chat-input',
  templateUrl: './chat-input.component.html',
  styleUrls: ['./chat-input.component.scss']
})
export class ChatInputComponent implements OnInit {

  @Input() chatData;

  @ViewChild("inputField") inputField;

  @Output() newMessageEmitter = new EventEmitter();

  newMessage = '';
  memberMentions = [];

  showSuggestMembers = false;
  showSuggestFiles = false;
  suggestValues = [];

  public publicFunctions = new PublicFunctions(this.Injector);

  constructor(
    public utilityService: UtilityService,
    private Injector: Injector
    ) { }

  async ngOnInit() {
    
  }

  async sendMessage() {
    if (this.newMessage) {
      await this.cleanMentions();
      this.newMessageEmitter.emit({message: this.newMessage, memberMentions: this.memberMentions});

      this.newMessage = '';
    }
  }

  async suggest(event: any) {
    const mentionChar = event.key;

    if (mentionChar === "@") {
      this.showSuggestMembers = true;

      // If User types "#" then trigger the list for files mentioning
    // } else if (mentionChar === "#") {
    //   this.showSuggestFiles = true;
    }

    if (this.showSuggestMembers) {
      const searchTerm = this.lastWord(this.newMessage);

      if (searchTerm[0] !== '@') {
        this.showSuggestMembers = false;
        this.suggestValues = [];
        return;
      }

      // Initialise values with list of members
      this.suggestValues = await this.publicFunctions.suggestMembersForChat(searchTerm.substring(1), this.chatData);

      // Adding All Object to mention all the members
      this.suggestValues.unshift({
        id: 'all',
        value: 'all'
      });

    // } else if (this.showSuggestFiles) {
    //   const searchTerm = this.lastWord(this.newMessage);

    //   if (searchTerm[0] !== '#') {
    //     this.showSuggestFiles = false;
    //     this.suggestValues = [];
    //     return;
    //   }

    //   // Initialise values with list of files
    //   this.suggestValues = await this.publicFunctions.suggestFilesForChat(searchTerm.substring(1), this.chatData);
    }
  }

  mentionMember(member: any) {
    const index = (this.memberMentions) ? this.memberMentions.findIndex(m => m._id == member._id) : -1;
    if (index < 0) {
      this.memberMentions.push(member);
    }

    const lastMentionIndex = this.newMessage.lastIndexOf('@');
    this.newMessage = this.newMessage.substring(0, lastMentionIndex) + '@' + member.value + ' ';
    
    this.suggestValues = [];
    this.showSuggestMembers = false;
    this.inputField.nativeElement.focus();
  }

  async cleanMentions() {
    this.memberMentions.forEach((mention, index) => {
      if (!this.newMessage.includes('@' + mention.value)) {
        this.memberMentions = this.memberMentions.slice(index, 1);
      }
    });

    // this.memberMentions = this.memberMentions.map((user) => { return user.id; });
  }

  // Check if the data provided is not empty{}
  checkDataExist(object: Object) {
    return this.utilityService.objectExists(object);
  }

  lastWord(text: string) {
    const n = text.split(" ");
    return n[n.length - 1];
  }
}
