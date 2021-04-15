import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { FlamingoEditorComponent } from './flamingo-editor/flamingo-editor.component';
import { FlamingoHeaderComponent } from './flamingo-header/flamingo-header.component';
import {FlamingoRoutingModule} from './flamingo-routing.module';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatSliderModule} from '@angular/material/slider';
@NgModule({
  declarations: [ FlamingoEditorComponent, FlamingoHeaderComponent],
  imports: [
    CommonModule,

    FlamingoRoutingModule,
    MatMenuModule,
    // Forms Module
    FormsModule,
    MatSlideToggleModule,
    MatSliderModule,
    // Tooltip Module
    NgbTooltipModule,
  ]
})
export class FlamingoModule { }
