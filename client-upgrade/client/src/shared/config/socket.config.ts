import { SocketIoConfig } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';

export const socketConfig: SocketIoConfig = { url: environment.BASE_URL, options: {
    secure: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    randomizationFactor: 0.5,
    autoConnect: true,
    timeout: Infinity
    } 
};