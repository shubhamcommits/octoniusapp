import { Response, Request, NextFunction } from "express";

/**
 * This function is the boiler plate for file handler mechanism for user profileImage
 * @param req 
 * @param res 
 * @param next 
 */
const groupFileHandler = (req: Request, res: Response, next: NextFunction) => {

    if (!req.files) {
        next();
    } else {

        /// Instantiate the fileName variable and add the date object in the name
        let fileName: any = Date.now().toString() + req['files'].groupAvatar['name'];

        // Get the file from the request
        const file: any = req['files'].groupAvatar;

        // Get the folder link from the environment
        const folder = process.env.FILE_UPLOAD_FOLDER;

        // Modify the file accordingly and handle request
        file.mv(folder + fileName, (error) => {
            if (error) {
                fileName = null;
                return res.status(500).json({
                    status: '500',
                    message: 'file upload error',
                    error
                });
            }

            // Modify the current request to add 
            req['fileName'] = fileName;

            // Pass the middleware// Pass the middleware
            next();
        });
    }

}

export { groupFileHandler }
