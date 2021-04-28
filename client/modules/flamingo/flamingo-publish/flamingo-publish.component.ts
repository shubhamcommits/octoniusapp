import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FlamingoService } from 'src/shared/services/flamingo-service/flamingo.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-flamingo-publish',
  templateUrl: './flamingo-publish.component.html',
  styleUrls: ['./flamingo-publish.component.scss']
})
export class FlamingoPublishComponent implements OnInit {

  flamingo: any;
  flamingoId: string;

  constructor(
    private _ActivatedRoute: ActivatedRoute,
    private flamingoService: FlamingoService,
    private utilityService: UtilityService
  ) { }

  async ngOnInit() {

    // Set the fileId variable
    this.flamingoId = this._ActivatedRoute.snapshot.params['id'];

    // Fetch Flamingo Details
    await this.flamingoService.getOne(this.flamingoId).then((res) => {
      this.flamingo = res['flamingo'];
    });
  }

  /**
   * Method to execute in front to call the service to publish or unpublish the flamingo
   */
  publish() {
    this.utilityService.getConfirmDialogAlert('Are you sure?', 'By doing this the flamingo will be published/unpublished!')
      .then((result) => {
        if (result.value) {
          // Call the HTTP Request Asynschronously
          this.utilityService.asyncNotification(
            'Please wait while we are publishing the flamingo',
            new Promise((resolve, reject) => {
              this.flamingoService.publish(this.flamingo._id, !this.flamingo.publish || false)
                .then((res) => {
                  this.flamingo = res['flamingo'];

                  resolve(this.utilityService.resolveAsyncPromise('Flamingo has been published!'));
                })
                .catch(() => {
                  reject(this.utilityService.rejectAsyncPromise('Unexpected error occured while publishing Flamingo, please try again!'));
                });
          }));
        }
      });
  }
}
