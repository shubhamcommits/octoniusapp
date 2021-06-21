import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-color-picker-dialog',
  templateUrl: './color-picker-dialog.component.html',
  styleUrls: ['./color-picker-dialog.component.scss']
})
export class ColorPickerDialogComponent implements OnInit {

  colorSelected;

  @Output() colorPickedEvent = new EventEmitter();

  colors = [];

  constructor(
    private mdDialogRef: MatDialogRef<ColorPickerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) {
  }

  ngOnInit() {
    this.colorSelected = this.data.colorSelected;

    this.colors = this.buildColors();
  }

  buildColors() {
    let colorsArr = [];
    // const steps = ['00', '11', '22', '33', '44', '55', '66', '77', '88', '99', 'aa', 'bb', 'cc', 'dd', 'ee', 'ff'];
    const steps = ['00', '33', '66', '99', 'cc', 'ff'];
    for(var i = 0; i < steps.length; i++){
      for(var j = 0; j < steps.length; j++){
        for(var k = 0; k < steps.length; k++){
          colorsArr.push('#' + steps[i] + steps[j] + steps[k]);
        }
      }
    }

    return colorsArr;
  }

  selectColor(color: string) {
    this.colorSelected = color;
    this.colorPickedEvent.emit(color);

    // Close the modal
    this.mdDialogRef.close();
  }
}
