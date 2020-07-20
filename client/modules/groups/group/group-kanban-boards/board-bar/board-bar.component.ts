import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-board-bar',
  templateUrl: './board-bar.component.html',
  styleUrls: ['./board-bar.component.scss']
})
export class BoardBarComponent implements OnInit {

  constructor() {}

  // GroupData Variable
  @Input() groupData: any;

  // Emitter to notify that the view is changing
  @Output() changeViewEmitter: EventEmitter<string> = new EventEmitter<string>();

  ngOnInit() {
  }

  changeView(view: string) {
    this.changeViewEmitter.emit(view);
  }
}
