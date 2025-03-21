import * as sockets from "./socket";
import * as helperFunctions from './helperFunctions';
import * as firebaseNotifications from './firebaseNotifications';
import { sendErr } from './sendError';
import { axios } from "./proxy";
import { Auths } from "./auth";

/*  =====================
 *  -- UTILS EXPORTS --
 *  =====================
 * */
export{
    
    // AUTHS
    Auths as Auths,

    // SOCKETS
    sockets as sockets,

    // HELPER FUNCTIONS
    helperFunctions as helperFunctions,

    // Send Error
    sendErr as sendError,

    axios as axios,

    firebaseNotifications as firebaseNotifications
}