import { Auths } from './auth';
import { hasProperty } from './helperFunctions';
import { Password } from './password';
import { sendErr } from './sendError';
import { axios } from './proxy'

/*  =====================
 *  -- UTILS EXPORTS --
 *  =====================
 * */
export {
    Auths as Auths,
    hasProperty as hasProperty,
    Password as PasswordHelper,
    sendErr as sendError,

    // PROXY CONFIGS
    axios as axios
}