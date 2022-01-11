import * as sockets from "./socket";
import * as helperFunctions from './helperFunctions';
import { sendErr } from './sendError';
import { axios } from "./proxy";

/*  =====================
 *  -- UTILS EXPORTS --
 *  =====================
 * */
export{

    // SOCKETS
    sockets as sockets,

    // HELPER FUNCTIONS
    helperFunctions as helperFunctions,

    // Send Error
    sendErr as sendError,

    axios as axios
}