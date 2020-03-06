import {Component, OnInit} from '@angular/core';
import io from "socket.io-client";
import {environment} from "../../../../../environments/environment";
import {Router} from "@angular/router";


@Component({
  selector: 'notifications-bar',
  templateUrl: './notifications-bar.component.html',
  styleUrls: ['./notifications-bar.component.scss']
})
export class NotificationsBarComponent implements OnInit {

  BASE_URL = environment.BASE_URL;
  user_data;
  notifications_data: any;
  socket = io(environment.SOCKET_BASE_URL, {
    transports: ['websocket'],
  });

  constructor(private router: Router) {
    this.user_data = JSON.parse(localStorage.getItem('user'));
  }

  async ngOnInit() {

    await this.socket.on('connect', async () => {
      await this.socket.emit('joinUser', this.user_data.user_id);
    });

    this.socket.on('notificationsFeed', (feed) => {
      this.notifications_data = feed;
    });

    this.socket.emit('getNotifications', this.user_data.user_id);

  }

  gotToPostPage(groupId, postId) {
    this.router.navigate(['dashboard', 'group', groupId, 'post', postId]);
  }

  toggled(event) {
    if (!event && this.notifications_data['unreadNotifications'].length > 0) {
      this.socket.emit('markRead', this.notifications_data['unreadNotifications'][0]._id, this.user_data.user_id);
    }
  }

}
