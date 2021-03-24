import { SocketIoConfig } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';

export const socketConfig: SocketIoConfig = {
    url: environment.NOTIFICATIONS_BASE_URL || `${window["env"]["websocket"]}://${window["env"]["domain"]}`,
    options: {
        secure: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 2000,
        randomizationFactor: 0.5,
        autoConnect: true,
        transports: ['websocket'],
        allowUpgrades : true,
        path: '/notifications',
        upgrade: true
    }
};
