import moment from 'moment';
import { File } from '../models';
import { Flamingo } from '../models';
import { Question } from '../models';

/*  ===============================
 *  -- Flamingo Service --
 *  ===============================
 */

export class FlamingoService {
    
    // Select File Fields on population
    fileFields: any = 'original_name modified_name type created_date';

    // Select User Fields on population
    userFields: any = 'first_name last_name profile_pic role email';

    // Select Group Fields on population
    groupFields: any = 'group_name group_avatar workspace_name _workspace';

    // Select Question Fields on population
    questionFields: any = 'type'; 

    // Select Group Fileds on population

    /**
     * This function is used to populate a flamingo with all the possible properties
     * @param file
     */
    async populateFlamingoProperties(flamingo: any) {

        // Populate file properties
        flamingo = await Flamingo.populate(flamingo, [
            { path: '_file', select: this.fileFields },
            {
                path: '_file',
                populate: {
                    path: '_posted_by',
                    model: 'User',
                    select: this.userFields 
                }
            },
            {
                path: '_file',
                populate: {
                    path: '_group',
                    model: 'Group',
                    select: this.groupFields 
                }
            },
            {
                path: '_file',
                populate: {
                    path: '_group',
                    populate: {
                        path: '_workspace',
                        model: 'Workspace',
                        select: '_id management_private_api_key'
                    }
                }
            },
            {
                path: '_file',
                populate: {
                    path: '_folder',
                    model: 'Folder'
                }
            },
            { path: '_questions' },
            { path: 'responses.answers._question' }
        ])

        // Return file with populated properties
        return flamingo
    }

    /**
     * This function is used to populate a file with all the possible properties
     * @param file
     */
    async populateFileProperties(file: any) {

        // Populate file properties
        file = await File.populate(file, [
            { path: '_group', select: this.groupFields },
            { path: '_posted_by', select: this.userFields },
            { path: '_folder', select: 'folder_name' },
        ])

        // Return file with populated properties
        return file
    }

    /** 
     * This function is responsible to create new flamingo form
     * @param data 
     */
    async createFlamingo(flamingoData:any){

        // Preparing File Data
        let flamingo: any = {
            _file: flamingoData._file,
            _questions: flamingoData._questions || []
        }

        // Create the new File
        flamingo = await Flamingo.create(flamingo);

        // Populate File Properties
        flamingo = this.populateFlamingoProperties(flamingo);

        // Return file
        return flamingo
    }

     /**
     * This function is responsible to get the flamingo data
     * @param groupId 
     * @param lastFormId 
     */
      async get(fileId: string) {

        let flamingo: any = await Flamingo.findOne({ _file: fileId })
        flamingo = this.populateFlamingoProperties(flamingo);
        
        return flamingo;
    }

    /** 
     * This function is responsible to add new question to flamingo form
     * @param questionId 
     * @param flamingoId 
     */
    async addQuestion(questionId:any,flamingoId:any){
        let query = {_id: flamingoId};
        let data = { $push: { _questions: questionId }}

        let flamigoupdated: any = await Flamingo.findByIdAndUpdate(query,data,{new:true});

        flamigoupdated = this.populateFlamingoProperties(flamigoupdated);

        return flamigoupdated;
    }

    /** 
     * This function is responsible to create new question
     * @param data 
     */
    async createQuestion(data:any){
        return await Question.create(data);
    }

    /** 
     * This function is responsible to add new question to flamingo form
     * @param questionId 
     * @param flamingoId 
     */
    async removeQuestion(questionId:any,flamingoId:any){
        let query = {_id: flamingoId};
        let data = { $pull: { _questions: questionId }}

        let flamigoupdated: any = await Flamingo.findByIdAndUpdate(query,data,{new:true});

        flamigoupdated = this.populateFlamingoProperties(flamigoupdated);

        return flamigoupdated;
    }

    /** 
     * This function is responsible to create new question
     * @param questionId 
     */
    async deleteQuestion(questionId: any) {
        return await Question.findOneAndDelete({_id:questionId}) ;
    }

    /** 
     * This function is responsible to create new question
     * @param questionId 
     * @param data 
     */
    async updateQuestion(questionId: any, data: any) {
        let query = { _id: questionId };
        let flamingoUpdated = await Question.findOneAndUpdate(
            query,
            data,
            { new : true });
        return this.populateFlamingoProperties(flamingoUpdated);
    }

    /** 
    * This function is responsible to publish/unpublish the flamingo
    * @param flamingoId 
    * @param publish
    */
    async publish(flamingoId, publish) {

        let flamingoUpdated = await Flamingo.findOneAndUpdate(
           { _id: flamingoId },
           { $set: {publish: publish }},
           { new: true}).lean();

        return this.populateFlamingoProperties(flamingoUpdated);
    }

    /** 
     * This function is responsible to submit the answers of a user
     * @param flamingoId 
     * @param responses
     */
    async submit(flamingoId, responses) {
        await Flamingo.findOneAndUpdate(
            { _id: flamingoId },
            {
                $push: {
                    responses: {
                        answers: responses,
                        created_date: moment().format()
                    }
                }
            },
            { new: true}).lean();
    }

    async copyFlamingo(fileId: string) {

        if (fileId) {
            // Find the folio by Id
            let oldFlamingo: any = await Flamingo.findOne({_file:fileId}).lean();

            // Populate File Properties
            oldFlamingo = await this.populateFlamingoProperties(oldFlamingo);

            let newFlamingo = oldFlamingo;
            let questions = oldFlamingo._questions;
            delete newFlamingo._id;
            delete newFlamingo.responses;
            newFlamingo.publish = false;
            newFlamingo.created_date = moment().format();

            // Duplicate questions
            newFlamingo._questions = [];

            for (let i = 0; i < questions.length; i++) {
                let newQuestion = await Question.findById(questions[i]?._id || questions[i]).lean();

                delete newQuestion._id;

                newQuestion.created_date = moment().format();

                newQuestion = await Question.create(newQuestion);
                newFlamingo._questions.push(newQuestion);
            }


            const file = await this.copyFile(fileId);

            newFlamingo._file = file._id;

            // Create new flamingo
            newFlamingo = await Flamingo.create(newFlamingo);

            // Return file
            return file;
        }
    }

    /**
     * This function is responsible for copying a folio to a group
     * @param fileId
     * @param groupId 
     */
    async copyFile(fileId: string) {

        if (fileId) {
            // Find the folio by Id
            let oldFile: any = await File.findById(fileId).lean();

            let newFile = oldFile;
            delete newFile._id;

            newFile.original_name = 'Copy of ' + oldFile.original_name;

            // Create new folio
            newFile = await File.create(newFile);

            // Populate File Properties
            return this.populateFileProperties(newFile)
        }
    }
}
