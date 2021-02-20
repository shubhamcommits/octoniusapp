import { SocketIoConfig } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';

export const socketConfig: SocketIoConfig = {
    url: 'wss://flash.octonius.com', options: {
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 2000,
        randomizationFactor: 0.5,
        autoConnect: true,
        transports: ['websocket'],
        upgrade: false
    }
};