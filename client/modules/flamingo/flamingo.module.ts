import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { FlamingoEditorComponent } from './flamingo-editor/flamingo-editor.component';
import { FlamingoHeaderComponent } from './flamingo-header/flamingo-header.component';
import {FlamingoRoutingModule} from './flamingo-routing.module';

@NgModule({
  declarations: [ FlamingoEditorComponent, FlamingoHeaderComponent],
  imports: [
    CommonModule,

    FlamingoRoutingModule,
    MatMenuModule,
    // Forms Module
    FormsModule,

    // Tooltip Module
    NgbTooltipModule,
  ]
})
export class FlamingoModule { }
