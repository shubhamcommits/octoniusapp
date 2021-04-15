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

    // Select Group Fileds on population
    groupFields: any = 'group_name group_avatar workspace_name'; 
    
    // Select Group Fileds on population
    questionFields: any = 'type text options image_url created_date scale show_scale_labels';

    /**
     * This function is used to populate a flamingo with all the possible properties
     * @param file
     */
     async populateFileProperties(flamingo: any) {

        // Populate file properties
        flamingo = await Flamingo.populate(flamingo, [
            { path: '_file', select: this.fileFields },
            {
                path: '_file',
                populate: {
                    path: '_posted_by',
                    model: 'User',
                    select: this.userFields 
                },
            },
            {
                path: '_file',
                populate: {
                    path: '_group',
                    model: 'Group',
                    select: this.groupFields 
                },
            },
            {
                path: '_file',
                populate: {
                    path: '_folder',
                    model: 'Folder'
                },
            },
            { path: 'questions', select: this.questionFields },
        ])

        // Return file with populated properties
        return flamingo
    }

    /** 
     * This function is responsible to create new flamingo form
     * @param data 
     */
    async createFlamingo(flamingoData:any){

        // Preparing File Data
        let flamingo: any = {
            _file: flamingoData._file,
            questions: flamingoData.questions,
        }

        // Create the new File
        flamingo = await Flamingo.create(flamingo);

        // Populate File Properties
        flamingo = this.populateFileProperties(flamingo);

        // Return file
        return flamingo
    }

     /**
     * This function is responsible to get the flamingo data
     * @param groupId 
     * @param lastFormId 
     */
      async get(fileId: string) {

        const flamingo = await Flamingo.findOne({_file:fileId})
        .populate({ path: '_file', select: this.fileFields })
        .populate({
            path: '_file',
            populate: {
                path: '_posted_by',
                model: 'User',
                select: this.userFields 
            },
        })
        .populate({
            path: '_file',
            populate: {
                path: '_group',
                model: 'Group',
                select: this.groupFields 
            },
        })
        .populate({
            path: '_file',
            populate: {
                path: '_folder',
                model: 'Folder'
            },
        })
        .populate({ path: 'questions', select: this.questionFields });
        
        return flamingo;
    }

    /** 
     * This function is responsible to add new question to flamingo form
     * @param questionId 
     * @param flamingoId 
     */
    async addQuestion(questionId:any,flamingoId:any){
        let query = {_id: flamingoId};
        let data = { $push: { questions: questionId }}

        let flamigoupdated = await Flamingo.findByIdAndUpdate(query,data,{new:true});

        flamigoupdated = this.populateFileProperties(flamigoupdated);

        return flamigoupdated;
    }

    /** 
     * This function is responsible to create new question
     * @param data 
     */
    async createQuestion(data:any){
        return await Question.create(data) ;
    }

     /** 
     * This function is responsible to add new question to flamingo form
     * @param questionId 
     * @param flamingoId 
     */
      async removeQuestion(questionId:any,flamingoId:any){
        let query = {_id: flamingoId};
        let data = { $pull: { questions: questionId }}

        let flamigoupdated = await Flamingo.findByIdAndUpdate(query,data,{new:true});

        flamigoupdated = this.populateFileProperties(flamigoupdated);

        return flamigoupdated;
    }

    /** 
     * This function is responsible to create new question
     * @param questionId 
     */
    async deleteQuestion(questionId:any){
        return await Question.findOneAndDelete({_id:questionId}) ;
    }

    /** 
     * This function is responsible to create new question
     * @param questionId 
     * @param data 
     */
     async updateQuestion(questionId:any,data:any){
        let query = { _id: questionId};
        return await Question.findOneAndUpdate(query,data,{new : true});
    }



}
