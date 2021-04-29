import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FlamingoService } from 'src/shared/services/flamingo-service/flamingo.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-result-insights',
  templateUrl: './result-insights.component.html',
  styleUrls: ['./result-insights.component.scss']
})
export class ResultInsightsComponent implements OnInit {

  @Input() flamingo: any;

  constructor(
    private _ActivatedRoute: ActivatedRoute,
    private flamingoService: FlamingoService,
    public utilityService: UtilityService
  ) { }

  async ngOnInit() {

  }
}
