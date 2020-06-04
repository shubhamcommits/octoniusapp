import { Response } from 'express';

/**
 * This Function is a boiler plate for sending the error states
 * @param res 
 * @param err 
 * @param message 
 * @param status 
 */
const sendErr = (res: Response, err: any, message?: string, status?: number) => {
    console.log(`\n⛔️ Error:\n ${err}`);
    return res.status(status || 500).json({
        message: message || 'Internal server error!',
        err: err || new Error()
    });
};

export { sendErr }