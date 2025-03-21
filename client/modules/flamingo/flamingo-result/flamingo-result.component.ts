import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PublicFunctions } from 'modules/public.functions';
import { FlamingoService } from 'src/shared/services/flamingo-service/flamingo.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-flamingo-result',
  templateUrl: './flamingo-result.component.html',
  styleUrls: ['./flamingo-result.component.scss']
})
export class FlamingoResultComponent implements OnInit {

  flamingo: any;
  fileId: string;

  // Public functions class member
  publicFunctions = new PublicFunctions(this._Injector);

  constructor(
    private _ActivatedRoute: ActivatedRoute,
    public utilityService: UtilityService,
    private _Injector: Injector
  ) { }

  async ngOnInit() {

    // Set the fileId variable
    this.fileId = this._ActivatedRoute.snapshot.params['id'];

    // Fetch Flamingo Details
    this.flamingo = await this.publicFunctions.getFlamingo(this.fileId);
  }
}
