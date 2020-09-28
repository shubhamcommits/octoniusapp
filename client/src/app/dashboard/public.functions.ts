import { Injector } from '@angular/core';
import { UserService } from "src/shared/services/user-service/user.service";
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { retry } from 'rxjs/internal/operators/retry';
import { SubSink } from 'subsink';
import { GroupsService } from 'src/shared/services/groups-service/groups.service';
import { Router, NavigationEnd } from '@angular/router';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { PostService } from 'src/shared/services/post-service/post.service';
import { ColumnService } from 'src/shared/services/column-service/column.service';
import moment from 'moment/moment';
import { FilesService } from 'src/shared/services/files-service/files.service';

export class PublicFunctions {

    constructor(
        private injector: Injector
    ) { }

    private subSink = new SubSink();

    public async getCurrentUser() {
        let userData: any = await this.getUserDetailsFromService();

        if (JSON.stringify(userData) == JSON.stringify({}))
            userData = await this.getUserDetailsFromStorage();

        if (JSON.stringify(userData) == JSON.stringify({}))
            userData = await this.getUserDetailsFromHTTP();

        this.sendUpdatesToUserData(userData);

        return userData || {};
    }

    public async getOtherUser(userId: string) {

        let userData = await this.getOtherUserDetailsFromHTTP(userId);

        return userData || {}
    }

    async getUserDetailsFromService() {
        return new Promise((resolve) => {
            const utilityService = this.injector.get(UtilityService);
            this.subSink.add(utilityService.currentUserData.subscribe((res) => {
                resolve(res)
            })
            )
        })
    }

    async getUserDetailsFromStorage() {
        const storageService = this.injector.get(StorageService);
        return (storageService.existData('userData') === null) ? {} : storageService.getLocalData('userData');
    }

    async getUserDetailsFromHTTP() {
        return new Promise((resolve, reject) => {
            const userService = this.injector.get(UserService);
            this.subSink.add(userService.getUser()
                .pipe(retry(3))
                .subscribe((res) => resolve(res['user']), (err) => reject({}))
            )
        })
    }

    async getOtherUserDetailsFromHTTP(userId: string) {
        return new Promise((resolve, reject) => {
            const userService = this.injector.get(UserService);
            this.subSink.add(userService.getOtherUser(userId)
                .pipe(retry(3))
                .subscribe((res) => resolve(res['user']), (err) => reject({}))
            )
        })
    }

    async sendUpdatesToUserData(userData: Object) {
        const storageService = this.injector.get(StorageService);
        const utilityService = this.injector.get(UtilityService);
        utilityService.updateUserData(userData);
        storageService.setLocalData('userData', JSON.stringify(userData))
    }

    public async getCurrentWorkspace() {
        let worspaceData = await this.getWorkspaceDetailsFromService();

        if (JSON.stringify(worspaceData) == JSON.stringify({}) || JSON.stringify(worspaceData) == JSON.stringify(undefined))
            worspaceData = await this.getWorkspaceDetailsFromStorage();

        if (JSON.stringify(worspaceData) == JSON.stringify({}) || JSON.stringify(worspaceData) == JSON.stringify(undefined))
            worspaceData = await this.getWorkspaceDetailsFromHTTP();

        this.sendUpdatesToWorkspaceData(worspaceData);

        return worspaceData || {};
    }

    async getWorkspaceDetailsFromService() {
        return new Promise((resolve) => {
            const utilityService = this.injector.get(UtilityService);
            this.subSink.add(utilityService.currentWorkplaceData.subscribe((res) => {
                resolve(res)
            })
            )
        })
    }

    async getWorkspaceDetailsFromStorage() {
        const storageService = this.injector.get(StorageService);
        return (storageService.existData('workspaceData') === null) ? {} : storageService.getLocalData('workspaceData');
    }

    async getWorkspaceDetailsFromHTTP() {
        return new Promise(async (resolve, reject) => {
            let userData = await this.getCurrentUser();
            const workspaceService = this.injector.get(WorkspaceService);
            const utilityService = this.injector.get(UtilityService);
            this.subSink.add(workspaceService.getWorkspace(userData['_workspace'])
                .pipe(retry(3))
                .subscribe((res) => { resolve(res['workspace']) },
                    (err) => {
                        console.log('Error occured while fetching the workspace details!', err);
                        utilityService.errorNotification('Error occured while fetching the workspace details, please try again!');
                        reject({})
                    })
            )
        })
    }

    async sendUpdatesToWorkspaceData(workspaceData: Object) {
        const storageService = this.injector.get(StorageService);
        const utilityService = this.injector.get(UtilityService);
        utilityService.updateWorkplaceData(workspaceData);
        storageService.setLocalData('workspaceData', JSON.stringify(workspaceData))
    }

    async getWorkspaceMembers(workspaceId?: string) {
        return new Promise(async (resolve, reject) => {
            let userData = await this.getCurrentUser();
            const workspaceService = this.injector.get(WorkspaceService);
            const utilityService = this.injector.get(UtilityService);
            workspaceService.getWorkspaceMembers(workspaceId || userData['_workspace'])
                .then((res) => {
                    resolve(res['results']);
                })
                .catch((err) => {
                    console.log('Error occured while fetching the workspace members!', err);
                    utilityService.errorNotification('Error occured while fetching the workspace members!, please try again!');
                    reject({})
                })
        })
    }

    public async getCurrentGroup() {

        let groupData = await this.getCurrentGroupFromService()

        this.sendUpdatesToGroupData(groupData);

        return groupData || {}
    }

    async getCurrentGroupFromService() {
        return new Promise((resolve) => {
            const utilityService = this.injector.get(UtilityService);
            this.subSink.add(utilityService.currentGroupData.subscribe((res) => {
                if (JSON.stringify(res) != JSON.stringify({}))
                    resolve(res)
            })
            )
        })
    }

    async sendUpdatesToGroupData(groupData: Object) {
        const utilityService = this.injector.get(UtilityService);
        utilityService.updateGroupData(groupData);
    }

    getRouterStateFromService() {
        return new Promise((resolve) => {
            const utilityService = this.injector.get(UtilityService);
            this.subSink.add(utilityService.routerStateData.subscribe((res) => {
                if (JSON.stringify(res) != JSON.stringify({}))
                    resolve(res)
            })
            )
        })
    }

    sendUpdatesToRouterState(routerStateData: Object) {
        const utilityService = this.injector.get(UtilityService);
        utilityService.updateRouterStateData(routerStateData);
    }

    public reuseRoute(router: Router) {

        // Adding shouldReuseRoute property
        router.routeReuseStrategy.shouldReuseRoute = function () {
            return false;
        };

        // Subscribe to router events and reload the page
        router.events.subscribe((evt) => {
            if (evt instanceof NavigationEnd) {
                router.navigated = false;
                window.scrollTo(0, 0);
            }
        });
    }

    /**
     * This function fetches the group details
     * @param groupId
     */
    public async getGroupDetails(groupId: string) {
        return new Promise((resolve, reject) => {
            let groupService = this.injector.get(GroupService);
            groupService.getGroup(groupId)
                .then((res) => {
                    resolve(res['group'])
                })
                .catch(() => {
                    this.sendError(new Error('Unable to fetch the group details, please try again!'))
                    reject({})
                })
        })
    }

    /**
     * This function returns the count of tasks of pulse for specific status
     * @param groupId
     * @param status - optional
     */
    public async getTasksThisWeekCount(groupId: string, status?: string) {

        // Groups service instance
        let groupsService = this.injector.get(GroupsService)

        return new Promise((resolve, reject) => {
            groupsService.getPulseTasks(groupId, status)
                .then((res) => resolve(res['numTasks']))
                .catch(() => reject(0));
        })
    }

    /**
     * This function returns the count of undone task which were due this week
     * @param groupId
     */
    public async getUndoneTasksThisWeek(groupId: string) {

        // Groups service instance
        let groupsService = this.injector.get(GroupsService)

        return new Promise((resolve, reject) => {
            groupsService.getUndoneTask(groupId)
                .then((res) => resolve(res['numTasks']))
                .catch(() => reject(0));
        })
    }

    /**
     * This function returns the tasks and posts which are present in a month for calendar
     * @param groupId
     * @param year
     * @param month
     * @param userId - optional
     */
    public async getCalendarPosts(year: any, month: any, groupId: string, userId?: any) {

        // Post service instance
        let postService = this.injector.get(PostService)

        return new Promise((resolve, reject) => {
            postService.getCalendarPosts(year, month, groupId, userId)
                .then((res) => resolve(res))
                .catch(() => reject([]));
        })
    }

    /**
     * This function is responsible for fetching the global feed for the currently loggedIn user
     */
    public getGlobalFeed(userId?: string) {
        return new Promise((resolve, reject) => {

            // User Service Instance
            let userService = this.injector.get(UserService)

            // Call the service function to fetch the data
            userService.getUserGlobalFeed(userId)
                .then((res) => {
                    resolve(res)
                })
                .catch(() => {
                    reject({})
                })
        })
    }

    /**
     * This function is responsible for fetching the users who are not present inside a group
     * @param groupId
     * @param query
     */
    membersNotInGroup(workspaceId: string, query: string, groupId: string, ) {
        try {
            return new Promise(async (resolve) => {

                // Create workspace service instance
                let workspaceService = this.injector.get(WorkspaceService);

                // Fetch the users based on the query and groupId
                let users = await workspaceService.getMembersNotInGroup(workspaceId, query, groupId)

                // Resolve with success
                resolve(users)
            })

        } catch (err) {
            this.catchError(err);
        }
    }

    /**
     * This function is responsible for fetching the users present inside a group
     * @param groupId
     * @param query
     */
    searchGroupMembers(groupId: string, query: string) {
        try {
            return new Promise(async (resolve) => {

                // Create group service instance
                let groupService = this.injector.get(GroupService);

                // Fetch the users based on the query and groupId
                let users = await groupService.getGroupMembers(groupId, query)

                // Resolve with success
                resolve(users)
            })

        } catch (err) {
            this.catchError(err);
        }
    }

    /**
     * Helper function fetching the next group members
     * @param groupId - current groupId
     * @param lastUserId - lastUserId fetched from current members array list
     */
    getNextGroupMembers(groupId: string, lastUserId: string, query: string) {
        return new Promise((resolve, reject) => {

            // Create group service instance
            let groupService = this.injector.get(GroupService);

            // Fetch the users from server
            groupService.getNextGroupMembers(groupId, lastUserId, query)
                .then((res) => {

                    // Resolve with sucess
                    resolve(res['users'])
                })
                .catch(() => {

                    // If there's an error, then
                    reject([]);
                })
        })
    }

    /**
     * Fetch list of first 10 groups of which a user is a part of
     * @param workspaceId
     * @param userId
     */
    public async getUserGroups(workspaceId: string, userId: string) {
        return new Promise((resolve, reject) => {
            let groupsService = this.injector.get(GroupsService);
            groupsService.getUserGroups(workspaceId, userId)
                .then((res) => resolve(res['groups']))
                .catch(() => reject([]))
        })
    }

    /**
     * Fetch list of next 5 groups of which a user is a part of based on the lastGroupId
     * @param workspaceId
     * @param userId
     * @param lastGroupId
     */
    public async getNextUserGroups(workspaceId: string, userId: string, lastGroupId: string) {
        return new Promise((resolve, reject) => {
            let groupsService = this.injector.get(GroupsService);
            groupsService.getNextUserGroups(workspaceId, userId, lastGroupId)
                .then((res) => resolve(res['groups']))
                .catch(() => reject([]))
        })
    }

    /**
     * This is the service function which calls the edit user API
     * @param userService
     * @param userData
     */
    public async userDetailsServiceFunction(userService: UserService, userData: Object) {
        return new Promise((resolve, reject) => {
            userService.updateUser(userData)
                .then((res) => resolve(res['user']))
                .catch(() => reject({}))
        })
    }

    /**
     * This function is responsible for editing the user details
     */
    async editUserDetails(openModal) {

        // Utility Service
        const utilityService = this.injector.get(UtilityService);

        // User service
        let userService = this.injector.get(UserService);

        // Open Model Function, which opens up the modal
        const { value: value } = await openModal;
        if (value) {
            utilityService.asyncNotification('Please wait we are updating your information...',
                new Promise((resolve, reject) => {
                    this.userDetailsServiceFunction(userService, value)
                        .then((user) => {

                            // Send the updates to the userData in the app for the updated data
                            this.sendUpdatesToUserData(user);

                            // Resolve with success
                            resolve(utilityService.resolveAsyncPromise('Details updated sucessfully!'))
                        })
                        .catch(() =>
                            reject(utilityService.rejectAsyncPromise('An unexpected occured while updating the details, please try again!')))
                }))
        } else if (JSON.stringify(value) == '') {
            utilityService.warningNotification('Kindly fill up all the details properly!');
        }
    }


    /**
     * This function is responsible for fetching the users present inside a workspace
     * @param workspaceId
     * @param query
     */
    searchWorkspaceMembers(workspaceId: string, query: string) {
        try {
            return new Promise(async (resolve) => {

                // Create workspace service instance
                let workspaceService = this.injector.get(WorkspaceService);

                // Fetch the users based on the query and workspaceId
                let users = await workspaceService.getWorkspaceMembers(workspaceId, query)

                // Resolve with success
                resolve(users)
            })

        } catch (err) {
            this.catchError(err);
        }
    }

    /**
     * Helper function fetching the next workspace members
     * @param workspaceId - current workspaceId
     * @param lastUserId - lastUserId fetched from current members array list
     */
    getNextWorkspaceMembers(workspaceId: string, lastUserId: string, query: string) {
        return new Promise((resolve, reject) => {

            // Create workspace service instance
            let workspaceService = this.injector.get(WorkspaceService);

            // Fetch the users from server
            workspaceService.getNextWorkspaceMembers(workspaceId, lastUserId, query)
                .then((res) => {

                    // Resolve with sucess
                    resolve(res['users'])
                })
                .catch(() => {

                    // If there's an error, then
                    reject([]);
                })
        })
    }

    /**
     * This function is responsible for fetching the posts from the server based on the groupId
     * @param groupId
     * @param lastPostId: optional
     */
    getPosts(groupId: string, type: string, lastPostId?: string) {

        // Post Service Instance
        let postService = this.injector.get(PostService);

        return new Promise((resolve, reject) => {
            postService.getPosts(groupId, type, lastPostId)
                .then((res: any) => {

                    // Resolve with sucess
                    resolve(res['posts'])
                })
                .catch(() => {

                    // If there's an error, then reject with empty array
                    reject([]);
                })
        })
    }

    /**
     * This function is responsible for fetching the tags from the server based on the groupId
     * @param groupId
     * @param tag: optional
     */
    getTags(groupId: string, tag: string) {

        // Post Service Instance
        let postService = this.injector.get(PostService);

        return new Promise((resolve, reject) => {
            postService.getTags(groupId, tag)
                .then((res: any) => {

                    // Resolve with success
                    resolve(res['tags'].map((tag: any) => tag.tags))
                })
                .catch(() => {

                    // If there's an error, then reject with empty array
                    reject([]);
                })
        })
    }

    /**
     * This function is responsible for fetching the files from the server based on the groupId
     * @param groupId
     * @param lastFileId: optional
     */
    getFiles(groupId: string, lastFileId?: string) {

        // Files Service Instance
        let filesService = this.injector.get(FilesService);

        return new Promise((resolve, reject) => {
            filesService.get(groupId, lastFileId)
                .then((res: any) => {

                    // Resolve with sucess
                    resolve(res['files'])
                })
                .catch(() => {

                    // If there's an error, then reject with empty array
                    reject([]);
                })
        })
    }

    /**
     * This function is responsible for fetching the files from the server
     * @param query
     */
    searchFiles(groupId: string, query: any, groupRef?: any) {
        return new Promise((resolve) => {
            let filesService = this.injector.get(FilesService)
            filesService.searchFiles(groupId, query, groupRef)
                .then((res) => resolve(res['files']))
                .catch(() => resolve([]))
        })
    }

    /**
     * This function is responsible for editing a post
     * @param postId
     * @param postData
     */
    onEditPost(postId: string, postData: FormData) {

        // Create Post Service Instance
        let postService = this.injector.get(PostService)

        // Asynchronously call the utility service
        return new Promise((resolve, reject) => {
            postService.edit(postId, postData)
                .then((res) => {

                    // Resolve with success
                    resolve(res['post'])
                })
                .catch((err) => {

                    // Catch the error and reject the promise
                    reject({})
                })
        })
    }

    /**
     * This function is responsible for fetching a post details
     * @param postId
     */
    getPost(postId: string) {

        // Create Post Service Instance
        let postService = this.injector.get(PostService)

        // Asynchronously call the utility service
        return new Promise((resolve, reject) => {
            postService.get(postId)
                .then((res) => {

                    // Resolve with success
                    resolve(res['post'])
                })
                .catch((err) => {

                    // Catch the error and reject the promise
                    reject({})
                })
        })
    }

    /**
     * This function is responsible for fetching all the columns present in a group
     * @param groupId
     */
    getAllColumns(groupId: string) {

        // Column Service Insctance
        let columnService = this.injector.get(ColumnService)

        // Call the HTTP Request to fetch the columns
        return new Promise((resolve, reject) => {
            columnService.getAllColumns(groupId)
                .then((res) => {

                    if (res == null)
                        resolve(null)

                    // Resolve with sucess
                    resolve(res['columns'])
                })
                .catch(() => {

                    // If there's an error, then reject with empty object
                    reject({})
                })
        })
    }

    /**
     * This function is responsible for changing the task assignee
     * @param postId
     * @param assigneeId
     */
    changeTaskAssignee(postId: string, assigneeId: string) {

        // Post Service Instance
        let postService = this.injector.get(PostService)

        // Utility Service Instance
        let utilityService = this.injector.get(UtilityService)

        utilityService.asyncNotification('Please wait we are changing the task assignee...',
            new Promise((resolve, reject) => {

                // Call HTTP Request to change the assignee
                postService.changeTaskAssignee(postId, assigneeId)
                    .then((res) => {
                        resolve(utilityService.resolveAsyncPromise(`Task assigned to ${res['post']['task']['_assigned_to']['first_name']}`))
                    })
                    .catch(() => {
                        reject(utilityService.rejectAsyncPromise(`Unable to assign the new assignee, please try again!`))
                    })

            }))
    }

    /**
     * This function is responsible to changing the task due date
     * @param postId
     * @param dueDate
     */
    changeTaskDueDate(postId: string, dueDate: string) {

        // Post Service Instance
        let postService = this.injector.get(PostService)

        // Utility Service Instance
        let utilityService = this.injector.get(UtilityService)

        utilityService.asyncNotification('Please wait we are changing the task due date...',
            new Promise((resolve, reject) => {

                // Call HTTP Request to change the request
                postService.changeTaskDueDate(postId, dueDate)
                    .then((res) => {
                        resolve(utilityService.resolveAsyncPromise(`Task due date changed to ${moment(dueDate).format('YYYY-MM-DD')}!`))
                    })
                    .catch(() => {
                        reject(utilityService.rejectAsyncPromise(`Unable to change the due date, please try again!`))
                    })

            }))
    }

    /**
     * This function is responsible to changing the task status
     * @param postId
     * @param status
     */
    changeTaskStatus(postId: string, status: string) {

        // Post Service Instance
        let postService = this.injector.get(PostService)

        // Utility Service Instance
        let utilityService = this.injector.get(UtilityService)

        utilityService.asyncNotification('Please wait we are updating the task status...',
          new Promise((resolve, reject) => {

            const user = this.getCurrentUser();

            // Call HTTP Request to change the request
            postService.changeTaskStatus(postId, status, user['_id'])
                .then((res) => {
                    resolve(utilityService.resolveAsyncPromise(`Task status marked as ${status}!`))
                })
                .catch(() => {
                    reject(utilityService.rejectAsyncPromise(`Unable to change the status, please try again!`))
                })

          }));
    }

    /**
     * This function is responsible to changing the task column
     * @param postId
     * @param title
     */
    changeTaskColumn(postId: string, title: string) {

        // Post Service Instance
        let postService = this.injector.get(PostService)

        // Utility Service Instance
        let utilityService = this.injector.get(UtilityService)

        utilityService.asyncNotification('Please wait we are moving the task to a new column...',
            new Promise((resolve, reject) => {

                // Call HTTP Request to change the request
                postService.changeTaskColumn(postId, title)
                    .then((res) => {
                        resolve(utilityService.resolveAsyncPromise(`Task moved to - ${title}!`))
                    })
                    .catch(() => {
                        reject(utilityService.rejectAsyncPromise(`Unable to move the task, please try again!`))
                    })

            }))
    }

    /**
   * This functions sends the update to other users about the updated workspace data
   * @param socketService
   * @param workspaceData
   */
    emitWorkspaceData(socketService: SocketService, workspaceData: any) {
        return socketService.onEmit('workspaceData', workspaceData).pipe(retry(Infinity)).subscribe()
    }

    /**
     * This functions sends the update to the user whose role has been updated
     * @param socketService
     * @param userId
     * @param userData
     */
    emitUserData(socketService: SocketService, userId: string, userData: Object) {
        return socketService.onEmit('userData', userId, userData).pipe(retry(Infinity)).subscribe()
    }

    async catchError(err: Error) {
        let utilityService = this.injector.get(UtilityService)
        console.log('There\'s some unexpected error occured, please try again!', err);
        utilityService.errorNotification('There\'s some unexpected error occured, please try again!');
    }

    async sendError(err: Error) {
        let utilityService = this.injector.get(UtilityService)
        console.log('There\'s some unexpected error occured, please try again!', err);
        utilityService.errorNotification(err.message);
    }

    async getAgoraGroupsNotJoined(workplaceId, userId) {
        let groupService = this.injector.get(GroupsService);
        return new Promise((resolve, reject) => {
            groupService.getAgoraGroupsNotJoined(workplaceId, userId).then((res) => {
                resolve(res['group']);
            }).catch((err) => {
                console.log(err);
                reject();
            })
        })
    }

    async joinAgora(groupId, userId) {
        let groupService = this.injector.get(GroupsService);
        let utilityService = this.injector.get(UtilityService);
        utilityService.asyncNotification('Joining Group...', new Promise((resolve, reject) => {
            groupService.joinAgora(groupId, userId).then((res) => {
                resolve(utilityService.resolveAsyncPromise('Successfully Joined Group'));
            }).catch((err) => {
                throw (err);
            })
        }))
    }

    async getNextAgoraGroups(workspaceId, userId, lastGroupId) {
        let groupService = this.injector.get(GroupsService);
        return new Promise((resolve, reject) => {
            groupService.getNextAgoraGroups(workspaceId, userId, lastGroupId).then((res) => {
                resolve(res['group']);
            }).catch((err) => {
                throw (err);
            })
        })
    }

    /**
     * This function unsubscribes the data from the observables
     */
    ngOnDestroy(): void {
        this.subSink.unsubscribe();
    }
}
