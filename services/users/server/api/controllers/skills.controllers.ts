import { User } from '../models';
import { Response, Request, NextFunction } from 'express';
import { sendError } from '../../utils';
import http from 'axios';

/*  ===================
 *  -- SKILLS METHODS --
 *  ===================
 * */
export class SkillsControllers {

    /**
     * This function is responsible for fetching the current loggedIn user skills
     * @param { userId }req 
     * @param res 
     * @param next 
     */
    async get(req: Request, res: Response, next: NextFunction) {

        const userId = req['userId'];

        try {

            // Find the user based on the userId
            const user: any = await User.findOne({
                $and: [
                    { _id: userId },
                    { active: true }
                ]
            })
                .select('skills integrations');

            // If user not found
            if (!user) {
                return sendError(res, new Error('Unable to find the user, either userId is invalid or you have made an unauthorized request!'), 'Unable to find the user, either userId is invalid or you have made an unauthorized request!', 404);
            }

            // Send status 200 response
            return res.status(200).json({
                message: 'User skills found!',
                skills: user.skills
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for adding a new skill to user object
     * @param { userId, params: { skill } }req 
     * @param res 
     */
    async addSkill(req: Request, res: Response) {

        // Get the userId of currently loggedIn user
        const userId = req['userId'];

        // Skill as the query parameter
        const { params: { skill } } = req;

        try {

            // Find the user on the basis of userId and update the skills array
            const user: any = await User.findOneAndUpdate({
                $and: [
                    { _id: userId },
                    { active: true }
                ]
            }, {
                $addToSet: {
                    skills: skill
                }
            }, {
                new: true
            })
                .select('skills full_name email active _id integrations');

            // If unable to update the user skills
            if (!user) {
                return sendError(res, new Error('Unable to find and update the user, either userId is invalid or any unexpected error has occurred'), 'Unable to find the user find and update, either userId is invalid or or any unexpected error has occurred', 404);
            }

            // Send status 200 response
            return res.status(200).json({
                message: `${skill} has been added to user skills!`,
                skills: user.skills
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for adding a new skill to user object
     * @param { userId, params: { skill } }req 
     * @param res 
     */
    async removeSkill(req: Request, res: Response) {

        // Get the userId of currently loggedIn user
        const userId = req['userId'];

        // Skill as the query parameter
        const { params: { skill } } = req;

        try {

            // Find the user on the basis of userId and update the skills array
            const user: any = await User.findOneAndUpdate({
                $and: [
                    { _id: userId },
                    { active: true }
                ]
            }, {
                $pull: {
                    skills: skill
                }
            }, {
                new: true
            })
                .select('skills full_name email active _id integrations');

            // If unable to update the user skills
            if (!user) {
                return sendError(res, new Error('Unable to find and update the user, either userId is invalid or any unexpected error has occurred'), 'Unable to find the user find and update, either userId is invalid or or any unexpected error has occurred', 404);
            }


            // Send status 200 response
            return res.status(200).json({
                message: `${skill} has been removed from user skills!`,
                skills: user.skills
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for showing skills only for auto complete in text input
     * @param user 
     * @param query 
     */
    createSkillsListQuery(user: any, query: any) {

        // process the user data records and return computed result
        return User.aggregate([{

            /**
             * Match all the users with the following conditions in the database:
             * 1. Query matching any skills exists in the user model
             * 2. Any user having the same workspace in which current user is in
             * 3. User is active and not disabled from the workspace
             */
            $match: {
                $and: [
                    { skills: { $regex: new RegExp(query, 'i') } },
                    { _workspace: user._workspace },
                    { active: { $eq: true } }
                ]
            }
        },
        { $unwind: "$skills" },
        {
            $match: {
                $and: [
                    { skills: { $regex: new RegExp(query, 'i') } },
                    { _workspace: user._workspace },
                    { active: { $eq: true } }
                ]
            }
        },
        {
            $project: {
                skills: '$skills'
            }
        }
        ])
    }

    /**
     * This function is responsible for generating the skills search result set
     * @param { userId, query: { query } }req 
     * @param res 
     */
    async getSkillsSearchResults(req: Request, res: Response, next: NextFunction) {

        // Get the userId of currently loggedIn user
        const userId = req['userId'];

        // Get the query to be where the query needs to be searched
        let skill: any  = req.query.skill;

        try {

            // Find user on the basis of userId
            const user = await User.findOne({ _id: userId });

            // Convert the query into regex 
            let regexConvert = skill.replace(/[#.*+?^${}()|[\]\\]/g, '\\$&')

            // Create the skills query and start aggregating the results & Execute the query and limit the result to 10
            let skills: any = await new SkillsControllers()
                .createSkillsListQuery(user, regexConvert)
                .skip(0)
                .limit(10)
                .exec() || [];

            // Filter the skills and remove the duplicates if any
            if (skills) {
                let key = ["skills"],
                    filtered = skills.filter(
                        (skill => (o: any) =>
                            (k => !skill.has(k) && skill.add(k))
                                (key.map(k => o[k]).join('|'))
                        )
                            (new Set)
                    );

                // Update the skills array to the new filtered array
                skills = filtered

                // Return the skills array and send status 200 response
                return res.status(200).json({
                    message: 'Successfully loaded search results',
                    skills: skills
                });
            }
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    };
}