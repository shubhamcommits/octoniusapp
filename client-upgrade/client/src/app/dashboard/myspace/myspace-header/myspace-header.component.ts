import { Component, OnInit } from '@angular/core';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-myspace-header',
  templateUrl: './myspace-header.component.html',
  styleUrls: ['./myspace-header.component.scss']
})
export class MyspaceHeaderComponent implements OnInit {

  constructor(private storageService: StorageService) { }

  userData: any;
  BASE_URL = environment.BASE_URL;

  async ngOnInit() {
   // Fetching the userdata object and decrypting it from the localStorage
   this.userData = await this.storageService.getLocalData('userData');
   console.log(this.userData)
  }

}
