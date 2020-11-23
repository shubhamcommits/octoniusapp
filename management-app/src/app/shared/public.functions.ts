import { Injector } from '@angular/core';
import { retry } from 'rxjs/internal/operators/retry';
import { SubSink } from 'subsink';
import { Router, NavigationEnd } from '@angular/router';
import { UtilityService } from './services/utility-service/utility.service';
import { StorageService } from './services/storage-service/storage.service';
import { UserService } from './services/user-service/user.service';

export class PublicFunctions {

    constructor(
        private injector: Injector
    ) { }

    private subSink = new SubSink();

    /**
     * This function unsubscribes the data from the observables
     */
    ngOnDestroy(): void {
        this.subSink.unsubscribe();
    }

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
}
