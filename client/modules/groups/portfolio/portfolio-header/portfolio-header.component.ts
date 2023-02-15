import { Component, OnInit, Injector, Input } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { environment } from 'src/environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { PortfolioService } from 'src/shared/services/portfolio-service/portfolio.service';
import { ColorPickerDialogComponent } from 'src/app/common/shared/color-picker-dialog/color-picker-dialog.component';
;
import { Router } from '@angular/router';

@Component({
  selector: 'app-portfolio-header',
  templateUrl: './portfolio-header.component.html',
  styleUrls: ['./portfolio-header.component.scss']
})
export class PortfolioHeaderComponent implements OnInit {

  @Input() portfolioData;
  @Input() userData;

  editTitle = false;
  title: string = '';

  editContent = false;
  htmlContent = '';
  quillData: any;
  contentChanged = false;

  chartLabels = [$localize`:@@portfolioHeader.completed:Completed`, $localize`:@@portfolioHeader.goalsPending:Targets pending`];
  chartReady = false;
  chartData = [0];
  chartType = 'doughnut';
  chartOptions = {
    cutoutPercentage: 50,
    responsive: true,
    legend: {
      display: false
    }
  };
  chartColors = [{
    backgroundColor: [
      '#17B2E3',
      '#F9FAFA'
    ]
  }];
  chartPlugins = [];

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public injector: Injector,
    public dialog: MatDialog,
    private router: Router,
    private utilityService: UtilityService,
    private portfolioService: PortfolioService
  ) { }

  async ngOnInit() {
    if (!this.objectExists(this.portfolioData)) {
      this.portfolioData = await this.publicFunctions.getCurrentPortfolioDetails();
    }

    // Fetch the current loggedIn user data
    if (!this.objectExists(this.userData)) {
      this.userData = await this.publicFunctions.getCurrentUser();
    }

    this.title = this.portfolioData.portfolio_name;

    if (this.portfolioData?.content){
      // let converter = new QuillDeltaToHtmlConverter(JSON.parse(this.portfolioData?.content)['ops'], {});
      // if (converter) {
      //   converter.renderCustomWith((customOp) => {
      //     // Conditionally renders blot of mention type
      //     if(customOp.insert.type === 'mention'){
      //       // Get Mention Blot Data
      //       const mention = customOp.insert.value;

      //       // Template Return Data
      //       return (
      //         `<span
      //           class="mention"
      //           data-index="${mention.index}"
      //           data-denotation-char="${mention.denotationChar}"
      //           data-link="${mention.link}"
      //           data-value='${mention.value}'>
      //           <span contenteditable="false">
      //             ${mention.value}
      //           </span>
      //         </span>`
      //       )
      //     }
      //   });
      //   // Convert into html
      //   this.htmlContent = converter.convert();
      // }
      this.htmlContent = await this.publicFunctions.convertQuillToHTMLContent(JSON.parse(this.portfolioData?.content)['ops']);
    }

    await this.portfolioService.getAllPortfolioTasksStats(this.portfolioData._id)
      .then((res) => {
        this.chartData = [res['completed'], res['numTasks'] - res['completed']];

        this.chartReady = true;
      });
  }

  ngOnDestroy() {
  }

  /**
   * This function is mapped with the event change of @variable - title
   * Show update detail option if title has been changed
   * @param event - new title value
   */
  async titleChange(event: any) {
    const newTitle = event.target.value;
    if (newTitle !== this.title) {
      this.title = newTitle;
      await this.utilityService.asyncNotification($localize`:@@portfolioHeader.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
          this.portfolioService.updatePortfolioProperties(this.portfolioData?._id, { 'portfolio_name': this.title })
            .then((res) => {
              this.portfolioData.portfolio_name = this.title;
              this.publicFunctions.sendUpdatesToPortfolioData(this.portfolioData);
              // Resolve with success
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@portfolioHeader.detailsUpdated:Details updated!`));
            })
            .catch(() => {
              reject(this.utilityService.rejectAsyncPromise($localize`:@@portfolioHeader.unableToUpdateDetails:Unable to update the details, please try again!`));
            });
        }));

      this.editTitle = !this.editTitle;
    }
  }

  quillContentChanged(event: any) {
    this.contentChanged = true;
    this.quillData = event;
  }

  async addManager(data: any) {
    await this.utilityService.asyncNotification($localize`:@@portfolioHeader.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
        this.portfolioService.addManagerToPortfolio(this.portfolioData?._id, data.assignee)
          .then((res) => {
            this.portfolioData = res['portfolio'];
            this.publicFunctions.sendUpdatesToPortfolioData(this.portfolioData);
            // Resolve with success
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@portfolioHeader.detailsUpdated:Details updated!`));
          })
          .catch(() => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@portfolioHeader.unableToUpdateDetails:Unable to update the details, please try again!`));
          });
      }));
  }

  async removeManager(data: any) {
    await this.utilityService.asyncNotification($localize`:@@portfolioHeader.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
        this.portfolioService.removeManagerToPortfolio(this.portfolioData?._id, data.assignee)
          .then((res) => {
            this.portfolioData = res['portfolio'];
            this.publicFunctions.sendUpdatesToPortfolioData(this.portfolioData);
            // Resolve with success
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@portfolioHeader.detailsUpdated:Details updated!`));
          })
          .catch(() => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@portfolioHeader.unableToUpdateDetails:Unable to update the details, please try again!`));
          });
      }));
  }

  async updateContent() {
    if (this.quillData && this.quillData?.mention) {
      this.portfolioData._content_mentions = this.quillData.mention.users.map((user)=> user.insert.mention.id)
    }
    this.portfolioData.content = this.quillData ? JSON.stringify(this.quillData.contents) : this.portfolioData?.content

    const portfolio = {
      content: this.portfolioData?.content,
      _content_mentions: this.portfolioData?._content_mentions
    }
    // Create FormData Object
    let formData = new FormData();

    // Append portfolio Data
    formData.append('portfolio', JSON.stringify(portfolio));

    await this.utilityService.asyncNotification($localize`:@@portfolioHeader.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
        this.portfolioService.updatePortfolioContent(this.portfolioData?._id, formData)
          .then(async (res) => {
            this.htmlContent = await this.publicFunctions.convertQuillToHTMLContent(JSON.parse(this.portfolioData?.content)['ops']);

            this.contentChanged = false;
            this.editContent = false;
            this.publicFunctions.sendUpdatesToPortfolioData(this.portfolioData);
            // Resolve with success
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@portfolioHeader.detailsUpdated:Details updated!`));
          })
          .catch(() => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@portfolioHeader.unableToUpdateDetails:Unable to update the details, please try again!`));
          });
      }));
  }

  openColorPicker() {
    const dialogRef = this.dialog.open(ColorPickerDialogComponent, {
      width: '67%',
      height: '50%',
      disableClose: false,
      hasBackdrop: true,
      data: { colorSelected: this.portfolioData?.background_color }
    });

    const colorPickedSubs = dialogRef.componentInstance.colorPickedEvent.subscribe(async (data) => {
      this.portfolioData.background_color = data;
      await this.utilityService.asyncNotification($localize`:@@portfolioHeader.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
        this.portfolioService.updatePortfolioProperties(this.portfolioData?._id, {
            'background_color': this.portfolioData?.background_color })
          .then((res) => {
            this.portfolioData = res['portfolio'];
            this.publicFunctions.sendUpdatesToPortfolioData(this.portfolioData);
            // Resolve with success
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@portfolioHeader.detailsUpdated:Details updated!`));
          })
          .catch(() => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@portfolioHeader.unableToUpdateDetails:Unable to update the details, please try again!`));
          });
      }));
    });

    dialogRef.afterClosed().subscribe(result => {
      colorPickedSubs.unsubscribe();
    });
  }

  deletePortfolio() {
    this.utilityService.getConfirmDialogAlert()
      .then((result) => {
        if (result.value) {
          // Remove the file
          this.utilityService.asyncNotification($localize`:@@portfolioHeader.pleaseWaitDeleting:Please wait we are deleting the portfolio...`, new Promise((resolve, reject) => {
            this.portfolioService.deletePortfolio(this.portfolioData?._id)
              .then((res) => {
                this.publicFunctions.sendUpdatesToPortfolioData({});
                this.router.navigate(['/dashboard', 'work', 'groups', 'all'],
                    {
                      queryParams: {
                        selectedTab: 'portfolio'
                      }
                    }
                  );

                resolve(this.utilityService.resolveAsyncPromise($localize`:@@portfolioHeader.deleted:Portfolio deleted!`));
              }).catch((err) => {
                reject(this.utilityService.rejectAsyncPromise($localize`:@@portfolioHeader.unableDelete:Unable to delete the portfolio, please try again!`));
              });
          }));
        }
      });
  }

  objectExists(object: any) {
    return this.utilityService.objectExists(object);
  }
}
