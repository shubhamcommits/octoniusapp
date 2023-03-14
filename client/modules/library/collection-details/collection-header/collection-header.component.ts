import { Component, Injector, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { PublicFunctions } from 'modules/public.functions';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { MatDialog } from '@angular/material/dialog';
import { ColorPickerDialogComponent } from 'src/app/common/shared/color-picker-dialog/color-picker-dialog.component';
;
import { Router } from '@angular/router';
import { LibraryService } from 'src/shared/services/library-service/library.service';
import { ShareCollectionDialogComponent } from 'src/app/common/shared/share-collection-dialog/share-collection-dialog.component';

@Component({
  selector: 'app-collection-header',
  templateUrl: './collection-header.component.html',
  styleUrls: ['./collection-header.component.scss']
})
export class CollectionHeaderComponent implements OnInit, OnChanges {

  @Input() collectionData;
  @Input() userData;
  @Input() workspaceData;
  @Input() groupData;
  @Input() canEdit;

  editTitle = false;
  title: string = '';

  editContent = false;
  htmlContent = '';
  quillData: any;
  contentChanged = false;

  // Public functions
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    public injector: Injector,
    public dialog: MatDialog,
    private router: Router,
    private utilityService: UtilityService,
    private libraryService: LibraryService
  ) { }

  async ngOnInit() {
  }

  async ngOnChanges(changes: SimpleChanges) {
    this.title = this.collectionData?.name;

    this.updateHTMLContent();
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
      await this.utilityService.asyncNotification($localize`:@@collectionHeader.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
          this.libraryService.editCollection(this.collectionData?._id, { 'name': this.title })
            .then((res) => {
              this.collectionData.name = this.title;
              // Resolve with success
              resolve(this.utilityService.resolveAsyncPromise($localize`:@@collectionHeader.detailsUpdated:Details updated!`));
            })
            .catch(() => {
              reject(this.utilityService.rejectAsyncPromise($localize`:@@collectionHeader.unableToUpdateDetails:Unable to update the details, please try again!`));
            });
        }));

      this.editTitle = !this.editTitle;
    }
  }

  quillContentChanged(event: any) {
    this.contentChanged = true;
    this.quillData = event;
  }

  async updateHTMLContent() {
    if (this.collectionData?.content){
      this.htmlContent = await this.publicFunctions.convertQuillToHTMLContent(JSON.parse(this.collectionData?.content)['ops']);
    }
  }

  // async addManager(data: any) {
  //   await this.utilityService.asyncNotification($localize`:@@collectionHeader.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
  //       this.libraryService.addManagerToCollection(this.collectionData?._id, data.assignee)
  //         .then((res) => {
  //           this.collectionData = res['collection'];
  //           // Resolve with success
  //           resolve(this.utilityService.resolveAsyncPromise($localize`:@@collectionHeader.detailsUpdated:Details updated!`));
  //         })
  //         .catch(() => {
  //           reject(this.utilityService.rejectAsyncPromise($localize`:@@collectionHeader.unableToUpdateDetails:Unable to update the details, please try again!`));
  //         });
  //     }));
  // }

  // async removeManager(data: any) {
  //   await this.utilityService.asyncNotification($localize`:@@collectionHeader.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
  //       this.libraryService.removeManagerFromCollection(this.collectionData?._id, data.assignee)
  //         .then((res) => {
  //           this.collectionData = res['collection'];
  //           // Resolve with success
  //           resolve(this.utilityService.resolveAsyncPromise($localize`:@@collectionHeader.detailsUpdated:Details updated!`));
  //         })
  //         .catch(() => {
  //           reject(this.utilityService.rejectAsyncPromise($localize`:@@collectionHeader.unableToUpdateDetails:Unable to update the details, please try again!`));
  //         });
  //     }));
  // }

  async updateContent() {
    if (this.quillData && this.quillData?.mention) {
      this.collectionData._content_mentions = this.quillData.mention.users.map((user)=> user.insert.mention.id)
    }
    this.collectionData.content = this.quillData ? JSON.stringify(this.quillData.contents) : this.collectionData?.content

    const collection = {
      content: this.collectionData?.content,
      _content_mentions: this.collectionData?._content_mentions
    }
    // Create FormData Object
    let formData = new FormData();

    // Append collection Data
    formData.append('collection', JSON.stringify(collection));

    await this.utilityService.asyncNotification($localize`:@@collectionHeader.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
        this.libraryService.editCollectionContent(this.collectionData?._id, formData)
          .then((res) => {
            this.collectionData = res['collection'];

            this.contentChanged = false;
            this.editContent = false;

            this.updateHTMLContent();

            // Resolve with success
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@collectionHeader.detailsUpdated:Details updated!`));
          })
          .catch(() => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@collectionHeader.unableToUpdateDetails:Unable to update the details, please try again!`));
          });
      }));
  }

  openColorPicker() {
    const dialogRef = this.dialog.open(ColorPickerDialogComponent, {
      width: '67%',
      height: '50%',
      disableClose: false,
      hasBackdrop: true,
      data: { colorSelected: this.collectionData?.background_color }
    });

    const colorPickedSubs = dialogRef.componentInstance.colorPickedEvent.subscribe(async (data) => {
      this.collectionData.background_color = data;
      await this.utilityService.asyncNotification($localize`:@@collectionHeader.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
        this.libraryService.editCollection(this.collectionData?._id, {
            'background_color': this.collectionData?.background_color })
          .then((res) => {
            this.collectionData = res['collection'];
            // Resolve with success
            resolve(this.utilityService.resolveAsyncPromise($localize`:@@collectionHeader.detailsUpdated:Details updated!`));
          })
          .catch(() => {
            reject(this.utilityService.rejectAsyncPromise($localize`:@@collectionHeader.unableToUpdateDetails:Unable to update the details, please try again!`));
          });
      }));
    });

    dialogRef.afterClosed().subscribe(result => {
      colorPickedSubs.unsubscribe();
    });
  }

  openShareDialog() {
    const dialogRef = this.dialog.open(ShareCollectionDialogComponent, {
      width: '60%',
      height: '75%',
      disableClose: false,
      hasBackdrop: true,
      data: { collectionData: this.collectionData }
    });

    // const colorPickedSubs = dialogRef.componentInstance.colorPickedEvent.subscribe(async (data) => {
    //   this.collectionData.background_color = data;
    //   await this.utilityService.asyncNotification($localize`:@@collectionHeader.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise((resolve, reject) => {
    //     this.libraryService.editCollection(this.collectionData?._id, {
    //         'background_color': this.collectionData?.background_color })
    //       .then((res) => {
    //         this.collectionData = res['collection'];
    //         // Resolve with success
    //         resolve(this.utilityService.resolveAsyncPromise($localize`:@@collectionHeader.detailsUpdated:Details updated!`));
    //       })
    //       .catch(() => {
    //         reject(this.utilityService.rejectAsyncPromise($localize`:@@collectionHeader.unableToUpdateDetails:Unable to update the details, please try again!`));
    //       });
    //   }));
    // });

    dialogRef.afterClosed().subscribe(result => {
      // colorPickedSubs.unsubscribe();
    });
  }

  deleteCollection() {
    this.utilityService.getConfirmDialogAlert()
      .then((result) => {
        if (result.value) {
          // Remove the file
          this.utilityService.asyncNotification($localize`:@@collectionHeader.pleaseWaitDeleting:Please wait we are deleting the collection...`, new Promise((resolve, reject) => {
            this.libraryService.deleteCollection(this.collectionData?._id, this.workspaceData?._id)
              .then((res) => {
                this.router.navigate(['/dashboard', 'work', 'groups', 'library']);

                resolve(this.utilityService.resolveAsyncPromise($localize`:@@collectionHeader.deleted:Collection deleted!`));
              }).catch((err) => {
                reject(this.utilityService.rejectAsyncPromise($localize`:@@collectionHeader.unableDelete:Unable to delete the collection, please try again!`));
              });
          }));
        }
      });
  }

  objectExists(object: any) {
    return this.utilityService.objectExists(object);
  }
}
