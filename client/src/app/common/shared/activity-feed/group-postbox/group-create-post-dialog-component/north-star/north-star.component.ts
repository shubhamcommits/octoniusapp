import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-north-star',
  templateUrl: './north-star.component.html',
  styleUrls: ['./north-star.component.scss']
})
export class NorthStarComponent implements OnInit {

  @Input() isNorthStar = false;
  @Input() northStar;

  @Output() transformIntoNorthStarEmitter = new EventEmitter();
  @Output() saveInitialNorthStarEmitter = new EventEmitter();

  types = ['Currency'];

  constructor() { }

  ngOnInit() {
    /*
    if (this.isNorthStar && this.northStar) {
      this.newType = this.northStar.type;
    }
    */
  }

  transformToNorthStart() {
    this.transformIntoNorthStarEmitter.emit();
  }

  changeType(type) {
    console.log(type.value);
  }

  saveInitial() {
    this.saveInitialNorthStarEmitter.emit(this.northStar);
  }

  updateProgress() {

  }
}
