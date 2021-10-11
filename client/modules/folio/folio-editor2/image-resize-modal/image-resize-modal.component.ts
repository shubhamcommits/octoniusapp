import { Component, ElementRef,Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'app-image-resize-modal',
  templateUrl: './image-resize-modal.component.html',
  styleUrls: ['./image-resize-modal.component.scss']
})

export class ImageResizeModalComponent implements OnInit {
  @Output() dataToSubmit = new EventEmitter<any>();
  alignment? : string;
  percentage? : number;
  constructor(public host : ElementRef<HTMLElement>) {
  }
  ngOnInit(): void {
  }
  onSubmit() {
    this.dataToSubmit.emit({
      alignment : this.alignment,
      percentage : this.percentage
    });
    this.host.nativeElement.remove();
  }
}
