import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Charts Module
import { NgChartsModule, ThemeService } from 'ng2-charts';

// Bar Graph Component
import { BarGraphComponent } from './bar-graph/bar-graph.component';
import { GenericGraphComponent } from './generic-graph/generic-graph.component';

// Material Module
import { MaterialModule } from 'src/app/common/material-module/material-module.module';



@NgModule({
  declarations: [
    BarGraphComponent,
    GenericGraphComponent
  ],
  imports: [
    CommonModule,
    NgChartsModule,
    MaterialModule
  ],
  exports: [
    BarGraphComponent,
    GenericGraphComponent
  ],
  providers: [ ThemeService ]
})
export class ChartModule { }
