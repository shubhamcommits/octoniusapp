import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  constructor(
    private _ActivatedRoute: ActivatedRoute,
    private flamingoService: FlamingoService,
    public utilityService: UtilityService
  ) { }

  async ngOnInit() {

    // Set the fileId variable
    this.fileId = this._ActivatedRoute.snapshot.params['id'];

    // Fetch Flamingo Details
    await this.flamingoService.getOne(this.fileId).then((res) => {
      this.flamingo = res['flamingo'];
    });
  }
}
