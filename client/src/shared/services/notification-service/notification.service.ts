import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';import { environment } from 'src/environments/environment';
 'rxjs/Observable';

@Injectable({providedIn: 'root'})
export class NotificationService {

    public BASE_API_URL = environment.NOTIFICATIONS_BASE_API_URL;
    
    public permission: Permission;

    constructor(
            private _http: HttpClient
        ) {
            this.permission = this.isSupported() ? 'default' : 'denied';
        }

    public isSupported(): boolean {
        return 'Notification' in window;
    }

    requestPermission(): void {
        let self = this;
        if ('Notification' in window) {
            Notification.requestPermission(function(status) {
                return self.permission = status;
            });
        }
    }

    create(title: string, options ? : any): any {
        let self = this;
        return new Observable((obs) => {
            if (!('Notification' in window)) {
                obs.complete();
            }
            if (self.permission !== 'granted') {
                obs.complete();
            }
            let _notify = new Notification(title, options);
            _notify.onshow = (e) => {
                //   let audio = new Audio(" "); // TODO Add sound url
                //   audio.play();
                return obs.next({
                    notification: _notify,
                    event: e
                });
            };
            _notify.onclick = (e) => {
                return obs.next({
                    notification: _notify,
                    event: e
                });
            };
            _notify.onerror = (e) => {
                return obs.error({
                    notification: _notify,
                    event: e
                });
            };
            _notify.onclose = function() {
                return obs.complete();
            };
        });
    }

    generateNotification(source: Array < any > ): void {
        let self = this;
        source.forEach((item) => {
            let options = {
                body: item.alertContent,
                icon: "../resource/images/bell-icon.png",
                sileng: false
            };
            let notify = self.create(item.title, options).subscribe();
        })
    }
}

export declare type Permission = 'denied' | 'granted' | 'default';
