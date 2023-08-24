import { Notification } from "../models";
import { DateTime } from 'luxon';

/*  ===============================
 *  -- Management Service --
 *  ===============================
 */
export class NotificationsService {

    async createNewUserNotificationForHR(userId: string, workspaceId: string) {
        await Notification.create({
                _owner: userId,
                _workspace: workspaceId,
                message: 'joined the workspace',
                type: 'hive',
                created_date: DateTime.now()
            });
    }
}