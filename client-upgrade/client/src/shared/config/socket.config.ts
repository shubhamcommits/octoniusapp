import { SocketIoConfig } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';

export const socketConfig: SocketIoConfig = {
    url: environment.SOCKETS_BASE_URL, options: {
        path: '/socket.io',
        secure: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 100,
        reconnectionDelayMax: 1000,
        randomizationFactor: 0.5,
        autoConnect: true,
        timeout: Infinity,
        // transports: ['websocket'],
        // upgrade: false
    }
};