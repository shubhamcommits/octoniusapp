import { Component, OnInit } from '@angular/core';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';

@Component({
    selector: 'push-notifications',
    templateUrl: './push-notifications.component.html',
    styleUrls: ['./push-notifications.component.scss']
})
export class PushNotificationsComponent implements OnInit {

    constructor(
        private socketService: SocketService,
        private storageService: StorageService,
        private utilityService: UtilityService
    ) { }

    userData: any = this.storageService.getLocalData('userData');

    async ngOnInit() {
        let connection = this.socketService.onEvent('connect')
        .subscribe((res)=>{
            this.socketService.onEmit('joinUser', this.userData['_id']);
        })
    }
}