import { Component, OnInit, Injector } from '@angular/core';
import { PublicFunctions } from 'src/app/dashboard/public.functions';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { SubSink } from 'subsink';
import { GoogleCloudService } from './user-available-clouds/google-cloud/services/google-cloud.service';

@Component({
  selector: 'app-user-clouds',
  templateUrl: './user-clouds.component.html',
  styleUrls: ['./user-clouds.component.scss']
})
export class UserCloudsComponent implements OnInit {

  constructor(
    public injector: Injector,
    private googleService: GoogleCloudService,
    private storageService: StorageService
  ) { }
  
  // Google Authentication Variable Check
  googleAuthSuccessful = false

  // Subsink 
  private subSink = new SubSink()

  // User Data Variable
  userData: Object

  // Public functions class member
  publicFunctions = new PublicFunctions(this.injector)

  // Google User
  googleUser: any

  async ngOnInit() {

    this.subSink.add(this.googleService.googleAuthSuccessfulBehavior.subscribe(auth => this.googleAuthSuccessful = auth))
    
    // Intialise the userData variable
    this.userData = await this.publicFunctions.getCurrentUser()

    this.googleUserExist() == true ? this.googleService.googleAuthSuccessfulBehavior.next(true): this.googleService.googleAuthSuccessfulBehavior.next(false)

    if(this.googleAuthSuccessful == true){
      this.googleUser = this.storageService.getLocalData('googleUser')['userData']
    } 
  }

  initiliazeGoogleUser(googleUser: any){
    this.googleUser = googleUser
  }

  googleUserExist() {
    return (this.storageService.existData('googleUser') === null) ? false : true
  }

}
