import e, { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";
import moment from 'moment/moment'
import { Group, Column, Auth, User } from '../models';
import { Auths, sendError } from '../../utils';
import FormData from 'form-data';
import axios from "axios";


/*  ===============================
 *  -- Teams CONTROLLERS --
 *  ===============================
 */
// Authentication Utilities Class
const auths = new Auths();

export class TeamsController {

     /**
     * This function is responsible to authenticate the user with teams
     * @param req 
     * @param res 
     * @param next 
     */
    async authTeam(req: Request , res: Response, next: NextFunction){
        
        // Find user with email
        const user = await User.findOne({email:req.body.user.email});

        // TeamAuth new record creating
        const teamAuth = {
            user_object_id: req.body.teamData.userObjectId,
            user_id:req.body.teamData.userID,
            tenant_id:  req.body.teamData.tid
        };

        //Integrations object from user
        var integration = user['integrations'];
        //Update the is_teams_connected to true
        integration['is_teams_connected'] = true;
        integration.teams = teamAuth

        try {
            //Update user integrations
            const update_user = await User.findOneAndUpdate({ _id: user._id },
                { $set: { integrations: integration }},
                { new: true });
            

        } catch (error) {
            console.log("error", error);
        }

        res.status(200).json({message:"Successfully"});
    }


    /**
     * This function is responsible to check the user is authenticated with teams
     * @param req 
     * @param res 
     * @param next 
     */
    async isAuthTeamUser(req: Request , res: Response, next: NextFunction){
        
        // Teams uer's aadObjectID
        const {user_object_id} = req.body ;

        // Find teams user's  record with aadObjectID
        const user = await User.findOne({'integrations.teams.user_object_id': user_object_id});

        // If user's record found 
        if (user) {
            // Find groups by octonius user's _id where user is admin
            let groupsBYAdmin = await Group.find({_admins: user._id});
            // Find groups by octonius user's _id where user is member
            let groupsByMember = await Group.find({_members:user._id});
            
            // Merge groups by members to groups by admin
            groupsByMember.forEach(groups => {
                groupsBYAdmin.push(groups);
            });

            // Send user groups and success message
            res.status(200).json({
                message:"Successfully",
                user,
                groupsBYAdmin
            });
        }else{
            res.status(200).json({message:"fails"});
        }
    }

    /**
     * This function is responsible to find colums and groups member and send to teams bot app.
     * @param req 
     * @param res 
     * @param next 
     */
    async getCardData(req: Request , res: Response, next: NextFunction){
        
        //Find Colums with groupId  
        const columnsList = await Column.find({_group:req.body.groupId});
        //Find Group with groupId
        const groupData = await Group.findOne({_id:req.body.groupId}).populate('_members').populate('_admins');
        // Extract groups's members and admin
        var groupMembers = groupData['_members'];
        var groupAdmins = groupData['_admins'];

        // Merge admins to members
        groupAdmins.forEach(member => {
            groupMembers.push(member);
        });

        //If colums and groups member exist.
        if(columnsList && columnsList.length>0 && groupMembers && groupMembers.length>0){
            res.status(200).json({message:"Successfully",columnsList,groupMembers});
        }else{
            res.status(200).json({message:"fails"});
        }


    }
    
     /**
     * This function is responsible to create a task.
     * @param req 
     * @param res 
     * @param next 
     */
    async teamTaskCreation(req: Request , res: Response, next: NextFunction){
        
        // Data from req.body
        const {assigneeId, title, description, groupSelectionId, columnSelection, assigneeSelection, dueDate } = req.body;

        // Find user by id
        const userOctonius = await  User.findById(assigneeId);

        // Bearer Token variable
        var BearerToken = "Bearer ";

        // Find the user's authentication if user is logged in
        const user_auth = await Auth.findOne({_user:userOctonius._id}).sort({created_date:-1});
        
        // extrat token
        const token = user_auth['token'];

        //validation bit
        var isvalidToken = true;

        //If token exist
        if(token && token != null){
            //token varification
            jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
                if (err || !decoded) {
                    isvalidToken = false;
                    sendError(res, err, 'Unauthorized request, it must have a valid authorization token!', 500);
                } else {

                    BearerToken = BearerToken+token;
                }
            });
        } else {
            isvalidToken = false;
        }
        
        // If token not valid generate token
        if(!isvalidToken){

            const user = userOctonius._id;

            const workspace_name = userOctonius.workspace_name;
            
            let tokens = await auths.generateToken(user, workspace_name);

            BearerToken = BearerToken+tokens['token'];

        }

        
        // Form data
        var formData = new FormData();

        // Postdata
        const postdata = {"title": title,"content": description,"type":"task","_posted_by":assigneeId,"_group": groupSelectionId,"_content_mentions":[],"_assigned_to": assigneeSelection,"task":{"status":"to do","_column": columnSelection,"due_to": moment(dueDate).format("YYYY-MM-DD")}};


        formData.append('post',JSON.stringify(postdata));

        
        
        try {

            //Sending request to post service to create a task.
            const responaxois = await axios({
                url : process.env.POSTS_SERVER_API,
                method:'POST',
                headers:{
                    'Content-Type': formData.getHeaders()['content-type'],
                    'Authorization': BearerToken,
                },
                data:formData
            });

            res.status(200).json({message:"Successfully"});
        } catch (error) {
            res.status(200).json({message:"fail"});
        }
    }

    /** 
     * This function is responsible to disconnect user from teams
     * @param req 
     * @param res 
     * @param next 
     */
    async disconnectTeam(req: Request , res: Response, next: NextFunction){
        try {
            let user;
            if (req.query?.uid) {
                // If uid exist in query params -> request from team to disconnect user from team

                // Find User by user_object_id
                user = await User.findOne({'integrations.teams.user_object_id': req.query.uid}).select('integrations');
                res.status(200).json({message:"Successfully"});
            } else if (req.query?.userId) {
                // Else If userId exist in query params -> request from Octonius Client to disconnect user from team

                // Find User by _id
                user = await User.findById({_id: req.query.userId}).select('integrations');
                res.status(200).json({ message: "Successfully" });
            }

            if (user) {
                // Extract the integrations
                var integration = user['integrations'];
                            
                // update the is_slack_connected false
                integration.is_teams_connected = false;
                integration.teams = null;

                // Update user integrations
                const updatedUser = await User.findOneAndUpdate({ _id: req.params.userID },
                    { $set: { integrations: integration }},
                    { new: true });

                res.status(200).json({ message: "Diconnected Successfully" });
            } else {
                res.status(200).json({message: "Disconnection failed"});
            }
        } catch (err){
            res.status(400).json({ message: "Cannot disconnet", error: err });
        }
        

    }

}
