import { Request, Response, NextFunction } from 'express';
import { User, Group } from '../models';
import { sendError } from '../../utils';


export class SmartGroupControllers {

    /**
     * Updates a smart group's rules.
     */
    async updateSmartGroup(req: Request, res: Response) {
        const { groupId } = req.params;
        const { type, payload } = req.body;

        try {
            if (type === 'email_domain') {
                await Group.findByIdAndUpdate(groupId, {
                    $addToSet: { 'conditions.email_domains': payload }
                });
            } else if (type === 'job_position') {
                await Group.findByIdAndUpdate(groupId, {
                    $addToSet: { 'conditions.job_positions': payload }
                });
            } else if (type === 'skills') {
                await Group.findByIdAndUpdate(groupId, {
                    $addToSet: { 'conditions.skills': payload }
                });
            }

            return res.status(200).json({
                message: 'Rule added successfully!'
            });
        } catch (error) {
            return sendError(res, error, 'Internal Server Error!', 500);
        }
    };

    /**
     * Gets a smart group's settings.
     */
    async getSmartGroupSettings(req: Request, res: Response) {
        const { groupId } = req.params;

        try {
            const groupDoc: any = await Group
                .findById(groupId)
                .select('conditions');

            return res.status(200).json({
                message: 'Rules successfully found!',
                domains: groupDoc.conditions.email_domains ? groupDoc.conditions.email_domains : [],
                positions: groupDoc.conditions.job_positions ? groupDoc.conditions.job_positions : [],
                skills: groupDoc.conditions.skills ? groupDoc.conditions.skills : []
            });
        } catch (error) {
            return sendError(res, error, 'Internal Server Error!', 500);
        }
    };

    /**
     * Deletes a smart group's rule.
     */
    async deleteSmartGroupRule(req: Request, res: Response) {
        const { groupId, rule } = req.params;

        try {
            if (rule === 'email_domains') {
                await Group.findByIdAndUpdate(groupId, {
                    $unset: { 'conditions.email_domains': '' }
                });
            } else if (rule === 'job_positions') {
                await Group.findByIdAndUpdate(groupId, {
                    $unset: { 'conditions.job_positions': '' }
                });
            } else if (rule === 'skills') {
                await Group.findByIdAndUpdate(groupId, {
                    $unset: { 'conditions.skills': '' }
                });
            }

            return res.status(200).json({
                message: 'Rule successfully deleted!'
            });
        } catch (error) {
            return sendError(res, error, 'Internal Server Error!', 500);
        }
    };

    /**
     * This method is responsible for the automatic
     * addition and deletion of smart group members
     * based on the provided rules.
     */
    async updateSmartGroupMembers(req: Request, res: Response) {
        const { groupId } = req.params;
        const { workspaceId } = req.body;
        const { emailDomains, jobPositions, skills } = req.body.currentSettings;

        try {
            // Get users in the group's workspace
            const users = await User.find({
                _workspace: workspaceId,
                active: true
            });

            const validUsers = new Set();
            if (emailDomains.length > 0) {
                // Filter users by email domain
                users.map((user: any) => {
                    const { email } = user;
                    const index = email.indexOf('@');
                    const emailDomain = email.substring(index + 1);

                    if (emailDomains.includes(emailDomain) && !validUsers.has(user._id.toString())) {
                        validUsers.add(user._id.toString());
                    }
                });
            }

            if (jobPositions.length > 0) {
                // Filter users by job positions
                users.map((user: any) => {
                    if (jobPositions.includes(user.current_position) && !validUsers.has(user._id.toString())) {
                        validUsers.add(user._id.toString());
                    }
                });
            }

            if (skills.length > 0) {
                // Filter users by skills
                users.map((user: any) => {
                    if (user.skills.some(skill => skills.includes(skill)) && !validUsers.has(user._id.toString())) {
                        validUsers.add(user._id.toString());
                    }
                });
            }

            // Remove owner/admin from prospective members
            const { _admins }: any = await Group
                .findById(groupId)
                .select('_admins');
            _admins.map((adminId) => {
                if (validUsers.has(adminId.toString())) {
                    validUsers.delete(adminId.toString());
                }
            });

            // Get current group members
            const { _members }: any = await Group
                .findById(groupId)
                .select('_members');

            // Remove the group from the current members' _groups set
            _members.map(async (userId) => {
                await User.findByIdAndUpdate(userId, {
                    $pull: { _groups: groupId }
                });
            });

            // Remove the current members from the group
            await Group.findByIdAndUpdate(groupId, {
                $set: { _members: [] }
            });

            if (emailDomains.length > 0 || jobPositions.length > 0 || skills.length > 0) {
                // Add new members
                Array.from(validUsers).map(async (userId) => {
                    // Add the user to the group
                    await Group.findByIdAndUpdate(groupId, {
                        $addToSet: { _members: userId }
                    });

                    // Add the group to the user document
                    await User.findByIdAndUpdate(userId, {
                        $addToSet: { _groups: groupId }
                    });
                });
            }

            return res.status(200).json({
                message: 'Group members successfully updated!'
            });
        } catch (error) {
            return sendError(res, error, 'Internal Server Error!', 500);
        }
    };

    /**
     * Gets every smart group and its rules within the
     * given workspace.
     */
    async getAllSmartGroupRules(req: Request, res: Response) {
        const { workspaceId } = req.params;

        try {
            const groups = await Group.find({
                type: 'smart',
                _workspace: workspaceId
            }).select('_id _workspace conditions');

            return res.status(200).json({
                groups: groups
            });
        } catch (error) {
            return sendError(res, error, 'Internal Server Error!', 500);
        }
    };
}

