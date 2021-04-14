import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-flamingo-editor',
  templateUrl: './flamingo-editor.component.html',
  styleUrls: ['./flamingo-editor.component.scss']
})
export class FlamingoEditorComponent implements OnInit {

  questions: any = [];

  activeQuestionIndex = 0;

  activeQuestion:any;

  newOption:any;

  updatedOption:any;
  
  constructor() { }

  ngOnInit(): void {

    this.questions.push({
      type: "Welcome",
      text: "Welcome to new Survey?",
      options:["new text"]
    })
    this.questions.push({
      type: "ShortText",
      text: "What is your name?"
    })
    this.questions.push({
      type: "Yes/No",
      text: "Is this your first job?"
    })
    this.questions.push({
      type: "Scale",
      text: "How much you are satisfied by the service?",
      scale:{
        size: 11,
      }
    })
    this.questions.push({
      type: "Dropdown",
      text: "Where are you from?",
      options:["new text"]
    })
    this.questions.push({
      type: "Thanks",
      text: "Thank you for your time!!!",
      options:["new text"]
    })
    this.activeQuestion = this.questions[this.activeQuestionIndex];
    console.log("questions list",this.questions);
}


changeQuestionText(event:any,index:number){
  console.log("sdcdd",index,event,this.questions[index].text)
  // this.questions[index].text = 'dcdsvsvf';
}

changeActiveIndex(index:number){
  this.activeQuestionIndex = index;
  this.activeQuestion = this.questions[this.activeQuestionIndex];

}

changeOptionText(event:any,i:number,j:number){
  if(j == null){
      this.questions[i].options.push(this.newOption);
      this.newOption='';
  }else if(j!= null){
    this.questions[i].options[j] = event.target.value;
  }
}
}
