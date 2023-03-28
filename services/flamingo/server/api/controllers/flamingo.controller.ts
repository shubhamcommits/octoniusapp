import { Response, Request, NextFunction } from "express";
import { sendError } from '../../utils';
import { FlamingoService } from "../service";

// Create instance of files service
let flamingoService = new FlamingoService();

// Creating Service class in order to build wrapper class

/*  ===============================
 *  -- FLAMINGO CONTROLLERS --
 *  ===============================
 */

export class FlamingoController {

    /** 
     * This function is responsible to flamingo form
     * @param req 
     * @param res 
     * @param next 
     */
    async createFlamingo(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the flamingoData From the request
            let { body: { flamingoData } } = req;

            // Create the file
            flamingoData = await flamingoService.createFlamingo(flamingoData);

            // Send Status 200 response
            return res.status(200).json({
                message: 'Flamingo has been Created!',
                flamingo: flamingoData
            });

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is used to fetch flamingo details
     * @param req 
     * @param res 
     * @param next 
     */
     async get(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the fileId From the request
            let { query: { fileId } } = req;

            // flamingo 
            let flamingo: any;
            
            flamingo = await flamingoService.get(fileId.toString());  

            // Send Status 200 response
            return res.status(200).json({
                message: 'Flamingos data fetched!',
                flamingo: flamingo
            });

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /** 
     * This function is responsible to create question and add it to flamingo form
     * @param req 
     * @param res 
     * @param next 
     */
    async createAndAddQuestion(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the questionData From the request
            let { body: { questionData } } = req;
            
            // Fetch the flamingoId From the request
            let { query: { flamingoId } } = req;

            let question = await flamingoService.createQuestion(questionData);

            let updatedFlamingo = await flamingoService.addQuestion(question._id,flamingoId);
            
            // Send Status 200 response
            return res.status(200).json({
                message: 'Question Created and add to Flamingos Success',
                flamingo: updatedFlamingo
            });

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /** 
     * This function is responsible to delete question and remove it from flamingo form
     * @param req 
     * @param res 
     * @param next 
     */
    async deleteAndRemoveQuestion(req: Request, res: Response, next: NextFunction) {
        try {
    
            // Fetch the flamingoId , questionId From the request
            let { query: { flamingoId ,questionId } } = req;

            let question = await flamingoService.deleteQuestion(questionId);

            let updatedFlamingo = await flamingoService.removeQuestion(questionId,flamingoId);

            // Send Status 200 response
            return res.status(200).json({
                message: 'Question Deleted and removed from Flamingos Success',
                flamingo: updatedFlamingo
            });

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }
    
    /** 
     * This function is responsible to update the question
     * @param req 
     * @param res 
     * @param next 
     */
     async updateQuestion(req: Request, res: Response, next: NextFunction) {
        try {
            // Fetch the questionData From the request
            let { body: { questionData } } = req;
            
            // Fetch the questionId From the request
            let { query: { questionId } } = req;


            let updatedQuestion= await flamingoService.updateQuestion(questionId, questionData);
                
            // Send Status 200 response
            return res.status(200).json({
                message: 'Question updated Success',
                question: updatedQuestion
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
     }

     /** 
     * This function is responsible to update the question
     * @param req 
     * @param res 
     * @param next 
     */
      async updloadQuestionImage(req: Request, res: Response, next: NextFunction) {
        try {
            // Fetch the questionData From the request
            let imageUrl = req['fileName'];
            
            let updatedQuestion= await flamingoService.updateQuestion(req.body.fileData.questionId, {image_url: imageUrl});
                
            // Send Status 200 response
            return res.status(200).json({
                message: 'Question updated Success',
                question: updatedQuestion
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
     }

     /** 
     * This function is responsible to publish/unpublish the flamingo
     * @param req 
     * @param res 
     * @param next 
     */
      async publish(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the publish From the request
            let { body: { publish } } = req;
            
            // Fetch the flamingoId From the request
            let { query: { flamingoId } } = req;

            let updatedFlamingo = await flamingoService.publish(flamingoId, publish);

            // Send Status 200 response
            return res.status(200).json({
                message: 'Flamingo Published/Unpublished correctly',
                flamingo: updatedFlamingo
            });

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
     }

     /** 
     * This function is responsible to submit the answers of a user
     * @param req 
     * @param res 
     * @param next 
     */
      async submit(req: Request, res: Response, next: NextFunction) {
        try {

            // Fetch the publish From the request
            let { body: { responses } } = req;
            
            // Fetch the flamingoId From the request
            let { query: { flamingoId } } = req;

            await flamingoService.submit(flamingoId, responses);

            // Send Status 200 response
            return res.status(200).json({
                message: 'Flamingo Submited correctly'
            });

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
     }

     /**
      * This function is responsible for copying a flamingo
      * @param req 
      * @param res 
      * @param next 
      */
     async copyFlamingo(req: Request, res: Response, next: NextFunction) {
         try {
 
             // Fetch the fileId from the request
             const { params: { fileId } } = req;
 
             // If fileId is not found, then throw the error
             if (!fileId) {
                 return res.status(400).json({
                     message: 'Please pass the fileId'
                 });
             }
 
             // Copy the folio
             let fileData = await flamingoService.copyFlamingo(fileId);
 
             // Send Status 200 response
             return res.status(200).json({
                 message: 'Flamingo copied!',
                 file: fileData
             })
 
         } catch (err) {
             return sendError(res, new Error('Internal Server Error!'), 'Internal Server Error!', 500);
         }
     }
}
