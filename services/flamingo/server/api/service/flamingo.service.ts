import { Flamingo } from '../models';


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
    questionFields: any = 'type text options image_url created_date';

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
        .populate({ path: 'questions', select: this.questionFields })
        
        return flamingo;
    }
}
