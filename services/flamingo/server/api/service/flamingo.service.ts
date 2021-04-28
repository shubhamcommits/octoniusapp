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
    groupFields: any = 'group_name group_avatar workspace_name';

    // Select Question Fields on population
    questionFields: any = 'type'; 

    // Select Group Fileds on population

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
            { path: '_questions' },
            {
                path: 'responses',
                populate: {
                    path: '_question',
                    model: 'Question',
                    select: this.questionFields
                }
            }
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
            questions: flamingoData._questions,
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

        let flamingo = await Flamingo.findOne({_file:fileId})
        flamingo = this.populateFileProperties(flamingo);
        
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
        let flamingoUpdated = await Question.findOneAndUpdate(query,data,{new : true});
        return this.populateFileProperties(flamingoUpdated);
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

        return this.populateFileProperties(flamingoUpdated);
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
                    responses: responses
                }
            },
            { new: true}).lean();
  }
}
