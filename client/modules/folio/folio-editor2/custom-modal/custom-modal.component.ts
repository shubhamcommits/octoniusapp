import { Component, ElementRef,Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'app-custom-modal',
  templateUrl: './custom-modal.component.html',
  styleUrls: ['./custom-modal.component.scss']
})

export class CustomModalComponent implements OnInit {
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
