import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { FlamingoService } from 'src/shared/services/flamingo-service/flamingo.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';

@Component({
  selector: 'app-flamingo-publish',
  templateUrl: './flamingo-publish.component.html',
  styleUrls: ['./flamingo-publish.component.scss']
})
export class FlamingoPublishComponent implements OnInit {

  flamingo: any;
  fileId: string;

  flamingoURL;

  constructor(
    private _ActivatedRoute: ActivatedRoute,
    private flamingoService: FlamingoService,
    private utilityService: UtilityService
  ) { }

  async ngOnInit() {

    // Set the fileId variable
    this.fileId = this._ActivatedRoute.snapshot.params['id'];
    this.flamingoURL = environment.clientUrl + '/document/flamingo/' + this.fileId + '/answer';

    // Fetch Flamingo Details
    await this.flamingoService.getOne(this.fileId).then((res) => {
      this.flamingo = res['flamingo'];
    });
  }

  /**
   * Method to execute in front to call the service to publish or unpublish the flamingo
   */
  publish() {
    this.utilityService.getConfirmDialogAlert($localize`:@@flamingoPublish.areYouSure:Are you sure?`, $localize`:@@flamingoPublish.flamingoWillBePublishedUnpublished:By doing this the flamingo will be published/unpublished!`)
      .then((result) => {
        if (result.value) {
          // Call the HTTP Request Asynschronously
          this.utilityService.asyncNotification(
            $localize`:@@flamingoPublish.pleaseWaitPublishingFlamingo:Please wait while we are publishing/unpublishing the flamingo`,
            new Promise((resolve, reject) => {
              this.flamingoService.publish(this.flamingo._id, !this.flamingo.publish || false)
                .then((res) => {
                  this.flamingo = res['flamingo'];

                  resolve(this.utilityService.resolveAsyncPromise($localize`:@@flamingoPublish.flamingoPublished:Flamingo has been published/unpublished!`));
                })
                .catch(() => {
                  reject(this.utilityService.rejectAsyncPromise($localize`:@@flamingoPublish.unexpectedErrorPublishing:Unexpected error occured while publishing/unpublishing Flamingo, please try again!`));
                });
          }));
        }
      });
  }

  /**
   * This function is responsible for copying the flamingo answers link to the clipboard
   */
  copyToClipboard() {

    // Create Selection Box
    let selBox = document.createElement('textarea');

    // Set the CSS Properties
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';

    selBox.value = this.flamingoURL;
    // Append the element to the DOM
    document.body.appendChild(selBox);

    // Set the focus and Child
    selBox.focus();
    selBox.select();

    // Execute Copy Command
    document.execCommand('copy');

    // Once Copied remove the child from the dom
    document.body.removeChild(selBox);

    // Show Confirmed notification
    this.utilityService.simpleNotification($localize`:@@flamingoPublish.copiedToClipboard:Copied to Clipboard!`);
  }
}
