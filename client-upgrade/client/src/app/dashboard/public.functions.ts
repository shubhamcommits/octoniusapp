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

export class PublicFunctions {

    constructor(
        private injector: Injector
    ) { }

    private subSink = new SubSink();

    public async getCurrentUser() {
        let userData = await this.getUserDetailsFromService();

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
                .subscribe((res) => { console.log(res); resolve(res['workspace']) },
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
            this.subSink.add(workspaceService.getWorkspaceMembers(workspaceId || userData['_workspace'])
                .subscribe((res) => {
                    resolve(res['results']);
                }, (err) => {
                    console.log('Error occured while fetching the workspace members!', err);
                    utilityService.errorNotification('Error occured while fetching the workspace members!, please try again!');
                    reject({})
                }))
        })
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

    /**
     * This function unsubscribes the data from the observables
     */
    ngOnDestroy(): void {
        this.subSink.unsubscribe();
    }
}