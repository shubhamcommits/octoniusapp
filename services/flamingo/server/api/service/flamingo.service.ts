import { Form } from '../models';


/*  ===============================
 *  -- Flamingo Service --
 *  ===============================
 */

export class FlamingoService {
    
    // Select User Fields on population
    userFields: any = 'first_name last_name profile_pic role email';

    // Select Group Fileds on population
    groupFields: any = 'group_name group_avatar workspace_name'; 
    
    // Select Group Fileds on population
    questionFields: any = 'type text options image_url created_date';

    /**
     * This function is used to populate a form with all the possible properties
     * @param file
     */
     async populateFileProperties(form: any) {

        // Populate file properties
        form = await Form.populate(form, [
            { path: '_group', select: this.groupFields },
            { path: '_owner', select: this.userFields },
            { path: 'questions', select: this.questionFields },
        ])

        // Return file with populated properties
        return form
    }

    /** 
     * This function is responsible to create new flamingo form
     * @param data 
     */
    async createForm(flamingoData:any){

        // Preparing File Data
        let form: any = {
            _group: flamingoData._group,
            _owner: flamingoData._owner,
            _folder: flamingoData._folder,
            name: flamingoData.name,
            questions: flamingoData.questions,
        }

        // Create the new File
        form = await Form.create(form);

        // Populate File Properties
        form = this.populateFileProperties(form);

        // Return file
        return form
    }

     /**
     * This function is responsible to get the forms
     * @param groupId 
     * @param lastFormId 
     */
      async get(groupId: string, lastFormId?: string) {

        let forms: any = []

        let query = {};
        
        // Fetch files on the basis of the params @lastPostId
        if (lastFormId) {
            query = {
                $and: [
                    { _group: groupId },
                    { _id: { $lt: lastFormId } }
                ]
            };   
            forms = await Form.find(query)
            .sort('-_id')
            .limit(5)
            .populate([
                { path: '_group', select: this.groupFields },
                { path: '_posted_by', select: this.userFields },
                { path: 'questions', select: this.questionFields }
            ])
            .lean();

        } else {
                query = { _group: groupId};
                forms = await Form.find(query)
                .sort('-_id')
                .limit(10)
                .populate([
                    { path: '_group', select: this.groupFields },
                    { path: '_posted_by', select: this.userFields },
                    { path: 'questions', select: this.questionFields }
                ])
                .lean();
        }

        // Return all the forms with the populated properties
        return forms;

    }
}
