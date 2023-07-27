import { Injectable, Injector } from '@angular/core';
import { retry } from 'rxjs/internal/operators/retry';
import { SubSink } from 'subsink';
import moment from 'moment/moment';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { UserService } from "src/shared/services/user-service/user.service";
import { WorkspaceService } from 'src/shared/services/workspace-service/workspace.service';
import { StorageService } from 'src/shared/services/storage-service/storage.service';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { GroupsService } from 'src/shared/services/groups-service/groups.service';
import { SocketService } from 'src/shared/services/socket-service/socket.service';
import { GroupService } from 'src/shared/services/group-service/group.service';
import { PostService } from 'src/shared/services/post-service/post.service';
import { ColumnService } from 'src/shared/services/column-service/column.service';
import { FilesService } from 'src/shared/services/files-service/files.service';
import { FoldersService } from 'src/shared/services/folders-service/folders.service';
import { ManagementPortalService } from 'src/shared/services/management-portal-service/management-portal.service';
import { AuthService } from 'src/shared/services/auth-service/auth.service';
import { FlamingoService } from 'src/shared/services/flamingo-service/flamingo.service';
import { environment } from 'src/environments/environment';
import { IntegrationsService } from 'src/shared/services/integrations-service/integrations.service';
import { ChatService } from 'src/shared/services/chat-service/chat.service';
import { PortfolioService } from 'src/shared/services/portfolio-service/portfolio.service';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';
import { LibraryService } from 'src/shared/services/library-service/library.service';
import { SearchService } from 'src/shared/services/search-service/search.service';

@Injectable({
  providedIn: 'root'
})
export class PublicFunctions {

    private subSink = new SubSink();

    constructor(
      private injector: Injector
    ) { }

    /**
     * This function unsubscribes the data from the observables
     */
    ngOnDestroy(): void {
      this.subSink.unsubscribe();
    }

    public async getCurrentUser(readOnly?: boolean) {
        let userData: any = await this.getUserDetailsFromService();
        const utilityService = this.injector.get(UtilityService);

        if (!utilityService.objectExists(userData)) {
            userData = await this.getUserDetailsFromStorage();
        }

        if (!utilityService.objectExists(userData)) {
          if (!readOnly) {
            userData = await this.getUserDetailsFromHTTP().catch(err => {
              userData = {};
            });
          } else {
            userData = {};
          }
        }

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
            }));
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
                .pipe(retry(1))
                .subscribe((res) => resolve(res['user']), (err) => reject(err))
            )
        })
    }

    async getOtherUserDetailsFromHTTP(userId: string) {
        return new Promise((resolve, reject) => {
            const userService = this.injector.get(UserService);
            this.subSink.add(userService.getOtherUser(userId)
                .pipe(retry(1))
                .subscribe((res) => resolve(res['user']), (err) => reject(err))
            )
        })
    }

    async sendUpdatesToUserData(userData: Object) {
      const storageService = this.injector.get(StorageService);
      const utilityService = this.injector.get(UtilityService);
      utilityService.updateUserData(userData);
      storageService.setLocalData('userData', JSON.stringify(userData))
    }

    public async getCurrentAccount() {
      let accountData: any = await this.getAccountDetailsFromService();
      const utilityService = this.injector.get(UtilityService);

      if (!utilityService.objectExists(accountData)) {
        accountData = await this.getAccountDetailsFromStorage();
      }

      if (!utilityService.objectExists(accountData)) {
        accountData = await this.getAccountDetailsFromHTTP();
      }

      this.sendUpdatesToAccountData(accountData);

      return accountData || {};
    }

    async getAccountDetailsFromService() {
        return new Promise((resolve) => {
            const utilityService = this.injector.get(UtilityService);
            this.subSink.add(utilityService.currentAccountData.subscribe((res) => {
                resolve(res)
            })
            )
        })
    }

    async getAccountDetailsFromStorage() {
        const storageService = this.injector.get(StorageService);
        return (storageService.existData('accountData') === null) ? {} : storageService.getLocalData('accountData');
    }

    async getAccountDetailsFromHTTP() {
        return new Promise((resolve, reject) => {
            const userService = this.injector.get(UserService);
            this.subSink.add(userService.getAccount()
                .pipe(retry(1))
                .subscribe((res) => resolve(res['account']), (err) => reject(err))
            )
        })
    }

    async sendUpdatesToAccountData(accountData: Object) {
        const storageService = this.injector.get(StorageService);
        const utilityService = this.injector.get(UtilityService);
        utilityService.updateAccountData(accountData);
        storageService.setLocalData('accountData', JSON.stringify(accountData))
    }

    public async getCurrentWorkspace() {
        let worspaceData = await this.getWorkspaceDetailsFromService();

        const utilityService = this.injector.get(UtilityService);

        if (!utilityService.objectExists(worspaceData)) {
            worspaceData = await this.getWorkspaceDetailsFromStorage();
        }

        if (!utilityService.objectExists(worspaceData)) {
            worspaceData = await this.getWorkspaceDetailsFromHTTP();
        }

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
            .pipe(retry(1))
            .subscribe((res) => { resolve(res['workspace']) },
              (err) => {
                console.log('Error occurred while fetching the workspace details!', err);
                utilityService.errorNotification($localize`:@@publicFunctions.errorOccuredWhileFetchingWorkspaceDetails:Error occurred while fetching the workspace details, please try again!`);
                reject(err)
            }));
      });
    }

    async sendUpdatesToWorkspaceData(workspaceData: Object) {
        const storageService = this.injector.get(StorageService);
        const utilityService = this.injector.get(UtilityService);
        utilityService.updateWorkplaceData(workspaceData);
        storageService.setLocalData('workspaceData', JSON.stringify(workspaceData))
    }

    async getWorkspaceDetails(workspaceId: string) {
        return new Promise(async (resolve, reject) => {
            const workspaceService = this.injector.get(WorkspaceService);
            const utilityService = this.injector.get(UtilityService);

            this.subSink.add(workspaceService.getWorkspace(workspaceId)
                .pipe(retry(1))
                .subscribe((res) => { resolve(res['workspace']) },
                    (err) => {
                        console.log('Error occurred while fetching the workspace details!', err);
                        utilityService.errorNotification($localize`:@@publicFunctions.errorOccuredWhileFetchingWorkspaceDetails:Error occurred while fetching the workspace details, please try again!`);
                        reject(err)
            }));
        });
    }

    async getWorkspaceMembers(workspaceId?: string) {
        return new Promise(async (resolve, reject) => {
            let userData = await this.getCurrentUser();
            const workspaceService = this.injector.get(WorkspaceService);
            const utilityService = this.injector.get(UtilityService);
            workspaceService.getWorkspaceMembers(workspaceId || userData['_workspace'])
                .then((res) => {
                    resolve(res['users']);
                })
                .catch((err) => {
                    console.log('Error occurred while fetching the workspace members!', err);
                    utilityService.errorNotification($localize`:@@publicFunctions.errorOccuredWhileFetchingWorkspaceMembers:Error occurred while fetching the workspace members!, please try again!`);
                    reject(err)
                })
        })
    }

    async getGroupMembersSocialStats(groupId: string, numDays: string) {
      return new Promise(async (resolve, reject) => {
            const groupService = this.injector.get(GroupService);
            const utilityService = this.injector.get(UtilityService);
            groupService.getGroupMembersSocialStats(groupId, numDays)
                .then((res) => {
                    resolve(res['users']);
                })
                .catch((err) => {
                    console.log('Error occurred while fetching the workspace members!', err);
                    utilityService.errorNotification($localize`:@@publicFunctions.errorOccuredWhileFetchingWorkspaceMembers:Error occurred while fetching the workspace members!, please try again!`);
                    reject(err)
               });
        });
    }

    async getWorkspaceMembersSocialStats(workspaceId: string, numDays: string, filteringGroups: any) {
      return new Promise(async (resolve, reject) => {
            let userData = await this.getCurrentUser();
            const workspaceService = this.injector.get(WorkspaceService);
            const utilityService = this.injector.get(UtilityService);
            workspaceService.getWorkspaceMembersSocialStats(workspaceId || userData['_workspace'], numDays, filteringGroups)
                .then((res) => {
                    resolve(res['users']);
                })
                .catch((err) => {
                    console.log('Error occurred while fetching the workspace members!', err);
                    utilityService.errorNotification($localize`:@@publicFunctions.errorOccuredWhileFetchingWorkspaceMembers:Error occurred while fetching the workspace members!, please try again!`);
                    reject(err)
               });
        });
    }

    public async getCurrentGroupDetails() {

        let groupData = {};

        groupData = await this.getCurrentGroupFromService();
        const utilityService = this.injector.get(UtilityService);

        if (!utilityService.objectExists(groupData)) {
          groupData = await this.getGroupDetailsFromStorage();
        }

        if (!utilityService.objectExists(groupData)) {
          groupData = await this.getGroupDetailsFromHTTP();
        }

        this.sendUpdatesToGroupData(groupData);

        return groupData || {};
    }

    async getCurrentGroupFromService() {
        return new Promise((resolve) => {
            const utilityService = this.injector.get(UtilityService);
            this.subSink.add(utilityService.currentGroupData.subscribe((res) => {
                resolve(res);
            }));
        });
    }

    async getGroupDetailsFromStorage() {
        const storageService = this.injector.get(StorageService);
        return (storageService.existData('groupData') === null) ? {} : storageService.getLocalData('groupData');
    }

    async getGroupDetailsFromHTTP() {
        return new Promise(async (resolve, reject) => {
            const router = this.injector.get(ActivatedRoute);
            const groupId = router.snapshot.queryParamMap.get('group');
            if (groupId) {
              const groupData = await this.getGroupDetails(groupId);
              resolve(groupData);
            } else {
              resolve({});
            }
        })
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
                  if (res) {
                    resolve(res['group']);
                  }
                })
                .catch((err) => {
                    this.sendError(new Error($localize`:@@publicFunctions.unableToFetchGroupDetails:Unable to fetch the group details, please try again!`))
                    reject(err)
                });
        });
    }

    async getGroupDetailsByPostId(postId: string) {
      return new Promise((resolve, reject) => {
        let groupService = this.injector.get(GroupService);
        groupService.getGroupByPostId(postId)
          .then((res) => {
            if (res) {
              resolve(res['group']);
            }
          })
          .catch((err) => {
              this.sendError(new Error($localize`:@@publicFunctions.unableToFetchGroupDetails:Unable to fetch the group details, please try again!`))
              reject(err)
          });
      });
    }

    async sendUpdatesToGroupData(groupData: Object) {
        const storageService = this.injector.get(StorageService);
        const utilityService = this.injector.get(UtilityService);
        utilityService.updateGroupData(groupData);
        storageService.setLocalData('groupData', JSON.stringify(groupData));
    }

    /**
     * This function changes the group current details
     * @param groupId
     */
    public async changeCurrentGroupDetails(groupId: string) {
      return new Promise(async (resolve, reject) => {
        const groupData = await this.getGroupDetails(groupId);
        this.sendUpdatesToGroupData(groupData);
        resolve(groupData);
      });
    }

    public async getCurrentPortfolioDetails() {

        let portfolioData = {};

        portfolioData = await this.getCurrentPortfolioFromService();
        const utilityService = this.injector.get(UtilityService);

        if (!utilityService.objectExists(portfolioData)) {
          portfolioData = await this.getPortfolioDetailsFromStorage();
        }

        this.sendUpdatesToPortfolioData(portfolioData);

        return portfolioData || {};
    }

    async getCurrentPortfolioFromService() {
        return new Promise((resolve) => {
            const utilityService = this.injector.get(UtilityService);
            this.subSink.add(utilityService.currentPortfolioData.subscribe((res) => {
                resolve(res);
            }));
        });
    }

    async getPortfolioDetailsFromStorage() {
        const storageService = this.injector.get(StorageService);
        return (storageService.existData('portfolioData') === null) ? {} : storageService.getLocalData('portfolioData');
    }

    /**
     * This function fetches the Portfolio details
     * @param portfolioId
     */
    public async getPortfolioDetails(portfolioId: string) {
        return new Promise((resolve, reject) => {
            let portfolioService = this.injector.get(PortfolioService);
            portfolioService.getPortfolio(portfolioId)
                .then((res) => {
                  if (res) {
                    resolve(res['portfolio']);
                  }
                })
                .catch((err) => {
                    this.sendError(new Error($localize`:@@publicFunctions.unableToFetchPortfolioDetails:Unable to fetch the portfolio details, please try again!`))
                    reject(err)
                });
        });
    }

    async sendUpdatesToPortfolioData(portfolioData: Object) {
        const storageService = this.injector.get(StorageService);
        const utilityService = this.injector.get(UtilityService);
        utilityService.updatePortfolioData(portfolioData);
        storageService.setLocalData('portfolioData', JSON.stringify(portfolioData));
    }

    isPersonalNavigation(groupData: any, userData: any) {
      return (groupData && userData)
        ?((groupData?.group_name === 'personal') && (groupData?._id == (userData?._private_group?._id || userData?._private_group)))
          ? true : false
        : true;
    }

    getRouterStateFromService() {
        return new Promise((resolve) => {
            const utilityService = this.injector.get(UtilityService);
            this.subSink.add(utilityService.routerStateData.subscribe((res) => {
              if (!utilityService.objectExists(res)) {
                resolve(res)
              }
            }));
        });
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

    getLoungeFromService() {
        return new Promise((resolve) => {
            const utilityService = this.injector.get(UtilityService);
            this.subSink.add(utilityService.loungeData.subscribe((res) => {
                if (!utilityService.objectExists(res)) {
                  resolve(res)
                }
            })
            )
        })
    }

    sendUpdatesToLoungeData(loungeData: Object) {
        const utilityService = this.injector.get(UtilityService);
        utilityService.updateLoungeData(loungeData);
    }

    getStoryFromService() {
        return new Promise((resolve) => {
            const utilityService = this.injector.get(UtilityService);
            this.subSink.add(utilityService.storyData.subscribe((res) => {
              if (!utilityService.objectExists(res)) {
                  resolve(res)
              }
            })
          )
        })
    }

    sendUpdatesToStoryData(storyData: Object) {
        const utilityService = this.injector.get(UtilityService);
        utilityService.updateStoryData(storyData);
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
                .catch((err) => {
                    reject(err)
                })
        })
    }

    /**
     * This function is responsible for fetching the users who are not present inside a group
     * @param groupId
     * @param query
     */
    membersNotInGroup(workspaceId: string, query: string, groupId: string,) {
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
            this.sendError(err);
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
            this.sendError(err);
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
          .catch(() => reject([]));
      });
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
     * Fetch list of groups of which a user is a part of
     */
    public async getAllUserGroups(workspaceId: string) {
        return new Promise((resolve, reject) => {
            let groupsService = this.injector.get(GroupsService);
            groupsService.getAllUserGroups(workspaceId)
                .then((res) => resolve(res['groups']))
                .catch(() => reject([]))
        })
    }

    /**
     * Fetch list of groups of which a user is manager
     * @param workspaceId
     * @param userId
     */
    public async getAllManagerGroups(workspaceId: string, userId: string) {
        return new Promise((resolve, reject) => {
            let groupsService = this.injector.get(GroupsService);
            groupsService.getAllManagerGroups(workspaceId, userId)
                .then((res) => resolve(res['groups']))
                .catch(() => reject([]))
        })
    }

    async getShuttleGroups(workspaceId: string, groupId: string) {
      return new Promise((resolve, reject) => {
          let workspaceService = this.injector.get(WorkspaceService);
          workspaceService.getShuttleGroups(workspaceId, groupId)
              .then((res) => resolve(res['groups']))
              .catch(() => reject([]))
      })
    }

    /**
     * This function is responsible for fetching the groups who are not present inside a workspace
     * @param groupId
     * @param query
     */
    searchAllGroupsList(workspaceId: string, query: string, groupId: string) {
        try {
            return new Promise(async (resolve) => {

                // Create workspace service instance
                let searchService = this.injector.get(SearchService);

                // Fetch the users based on the query and groupId
                await searchService.searchAllGroupsList(workspaceId, query, groupId).then(res => {
                  // Resolve with success
                  resolve(res['groups'])
                });
            })

        } catch (err) {
            this.sendError(err);
        }
    }

    /**
     * This function is responsible for fetching the users who are not present inside a workspace
     * @param groupId
     * @param query
     */
    searchAllUsersList(workspaceId: string, query: string) {
      try {
        return new Promise(async (resolve) => {

          // Create workspace service instance
          let searchService = this.injector.get(SearchService);

          // Fetch the users based on the query and groupId
          await searchService.searchAllUsersList(workspaceId, query).then(res => {
            // Resolve with success
            resolve(res['users'])
          });
        });
      } catch (err) {
          this.sendError(err);
      }
    }

    /**
     * Fetch list of portfolios of which a user is a part of
     */
    public async getUserPortfolios() {
        return new Promise((resolve, reject) => {
            let portfolioService = this.injector.get(PortfolioService);
            portfolioService.getUserPortfolios()
                .then((res) => resolve(res['portfolios']))
                .catch(() => reject([]))
        });
    }

    /**
     * Fetch list of user´s favorite groups
     * @param userId
     */
    public async getUserFavoriteGroups(userId: string) {
        return new Promise((resolve, reject) => {
            let usersService = this.injector.get(UserService);
            usersService.getUserFavoriteGroups(userId)
                .then((res) => resolve(res['user']['stats']['favorite_groups']))
                .catch(() => reject([]))
        })
    }

    /**
     * Fetch list of user´s favorite portfolios
     * @param userId
     */
    public async getUserFavoritePortfolios(userId: string) {
        return new Promise((resolve, reject) => {
            let usersService = this.injector.get(UserService);
            usersService.getUserFavoritePortfolios(userId)
                .then((res) => resolve(res['user']['stats']['favorite_portfolios']))
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
                .catch((error) => reject(error))
        })
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
            this.sendError(err);
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
    getPosts(groupId: string, type: string, pinned: boolean = false, lastPostId?: string, filters?: any) {

        // Post Service Instance
        let postService = this.injector.get(PostService);

        return new Promise((resolve, reject) => {
            postService.getPosts(groupId, type, pinned, lastPostId, filters)
                .then((res: any) => {

                    // Resolve with sucess
                    resolve(res['posts'])
                })
                .catch((err) => {
                    // If there's an error, then reject with empty array
                    reject([]);
                })
        })
      }

      /**
       * This function is responsible for fetching the shuttle tasks from the server based on the groupId
       * @param groupId
       */
       getShuttleTasks(groupId: string) {

          // Group Service Instance
          let groupService = this.injector.get(GroupService);

          return new Promise((resolve, reject) => {
              groupService.getShuttleTasks(groupId)
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
     * This function is responsible for fetching the tasks from the server based on the groupId
     * @param groupId
     * @param period
     */
    getAllGroupTasks(groupId: string, period: string) {

        // Post Service Instance
        let postService = this.injector.get(PostService);

        return new Promise((resolve, reject) => {
            postService.getAllGroupTasks(groupId, period)
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
     * This function is responsible for fetching the archived tasks from the server based on the groupId
     * @param groupId
     */
    getArchivedTasks(groupId: string) {

      // Post Service Instance
      let postService = this.injector.get(PostService);

      return new Promise((resolve, reject) => {
          postService.getArchivedTasks(groupId)
              .then((res: any) => {
                  // Resolve with sucess
                  resolve(res['posts'])
              })
              .catch(() => {
                  // If there's an error, then reject with empty array
                  reject([]);
              });
      });
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
     * This function is responsible for fetching a file's details
     * @param fileId
     */
    getFile(fileId: string, readOnly?: boolean) {
      if (fileId) {
        // Files Service
        let fileService = this.injector.get(FilesService);

        return new Promise((resolve) => {
          // Fetch the file details
          fileService.getOne(fileId, readOnly)
            .then((res) => {
              resolve(res['file'])
            })
            .catch(() => {
              resolve({})
            });
        });
      } else {
        return Promise.resolve({});
      }
    }

    /**
    * This function is responsible for fetching a flamingo's details
    * @param fileId
    */
    public async getFlamingo(fileId: any) {
      return new Promise((resolve) => {

        // Flamingo Service
        let flamingoService = this.injector.get(FlamingoService);

        // Fetch the Flamingo details
        flamingoService.getOne(fileId)
          .then((res) => {
            resolve(res['flamingo'])
          })
          .catch(() => {
            resolve({})
          });
      });
    }

    /**
     * This function is responsible for fetching the files from the server based on the groupId
     * @param groupId
     * @param folderId
     * @param lastFileId: optional
     */
    getFiles(groupId: string, folderId: string, lastFileId?: string) {

        // Files Service Instance
        let filesService = this.injector.get(FilesService);

        return new Promise((resolve, reject) => {
            filesService.get(groupId, folderId, lastFileId)
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

    getFilteredFiles(groupId: string, folderId: string, filterBit: string, filterData: any) {
      // Files Service Instance
      let filesService = this.injector.get(FilesService);

      return new Promise((resolve, reject) => {
          filesService.getFilteredFiles(groupId, folderId, filterBit, filterData)
              .then((res: any) => {
                  // Resolve with sucess
                  resolve(res['files'])
              }).catch(() => {
                  // If there's an error, then reject with empty array
                  reject([]);
              })
      })
    }

    /**
     * This function is responsible for fetching the campaign files from the server based on the groupId
     * @param groupId
     * @param folderId
     * @param lastFileId: optional
     */
     getCampaignFiles(groupId: string) {

        // Files Service Instance
        let filesService = this.injector.get(FilesService);

        return new Promise((resolve, reject) => {
            filesService.getCampaignFiles(groupId)
                .then((res: any) => {

                    // Resolve with sucess
                    resolve(res['file'])
                })
                .catch(() => {

                    // If there's an error, then reject with empty array
                    reject([]);
                })
        })
    }

    /**
     * This function is responsible for fetching the folders from the server based on the groupId
     * @param groupId
     */
    getFolders(groupId: string, folderId?: string) {

        // Folders Service Instance
        let foldersService = this.injector.get(FoldersService);

        return new Promise((resolve, reject) => {
          foldersService.get(groupId, folderId)
                .then((res: any) => {
                    // Resolve with sucess
                    resolve(res['folders'])
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
    searchFiles(groupId: string, query: any, groupRef?: any, workspaceId?: string) {
        return new Promise((resolve) => {
            let filesService = this.injector.get(FilesService)
            filesService.searchFiles(groupId, query, groupRef, workspaceId)
                .then((res) => resolve(res['files']))
                .catch(() => resolve([]))
        })
    }

    /**
     * This function is responsible for fetching the files from the server
     * @param query
     */
    searchPages(groupId: string, query: any, workspaceId: string) {
        return new Promise((resolve) => {
            let libraryService = this.injector.get(LibraryService)
            libraryService.searchPages(groupId, query, workspaceId)
                .then((res) => resolve(res['pages']))
                .catch(() => resolve([]))
        })
    }

    /**
     * This function is responsible for editing a post
     * @param postId
     * @param postData
     */
    onEditPost(postId: string, workspaceId: string, postData: FormData) {

        // Create Post Service Instance
        let postService = this.injector.get(PostService)

        // Asynchronously call the utility service
        return new Promise((resolve, reject) => {
            postService.edit(postId, workspaceId, postData)
                .then((res) => {

                    // Resolve with success
                    resolve(res['post'])
                })
                .catch((err) => {

                    // Catch the error and reject the promise
                    reject(err)
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
                    reject(err)
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

                    if (res == null) {
                        resolve([]);
                    }

                    // Resolve with sucess
                    resolve(res['columns']);
                })
                .catch((err) => {
                    // If there's an error, then reject with empty object
                    reject(err);
                })
        })
    }

    /**
     * This function is responsible for fetching all the columns present in a group
     * @param groupId
     */
    getAllArchivedColumns(groupId: string) {

        // Column Service Insctance
        let columnService = this.injector.get(ColumnService)

        // Call the HTTP Request to fetch the columns
        return new Promise((resolve, reject) => {
            columnService.getAllArchivedColumns(groupId)
                .then((res) => {

                    if (res == null) {
                        resolve([]);
                    }

                    // Resolve with sucess
                    resolve(res['columns']);
                })
                .catch((err) => {
                    // If there's an error, then reject with empty object
                    reject(err);
                })
        })
    }

    /**
     * This function is responsible for changing the task assignee
     * @param postId
     * @param assigneeId
     */
    changeTaskAssignee(postId: string, assigneeId: string) {
        let postService = this.injector.get(PostService)
        let utilityService = this.injector.get(UtilityService)
        let managementPortalService = this.injector.get(ManagementPortalService)

        utilityService.asyncNotification($localize`:@@publicFunctions.pleaseWaitWeChangeTaskAssignee:Please wait we are changing the task assignee...`,
            new Promise(async (resolve, reject) => {
                const isShuttleTasksModuleAvailable = await this.isShuttleTasksModuleAvailable();
                const isIndividualSubscription = await managementPortalService.checkIsIndividualSubscription();
                // Call HTTP Request to change the assignee
                postService.changeTaskAssignee(postId, assigneeId, isShuttleTasksModuleAvailable, isIndividualSubscription)
                    .then((res) => {
                        resolve(utilityService.resolveAsyncPromise($localize`:@@publicFunctions.taskAssigned:Task assigned to ${res['post']['task']['_assigned_to']['first_name']}`))
                    })
                    .catch(() => {
                        reject(utilityService.rejectAsyncPromise($localize`:@@publicFunctions.unableToAssign:Unable to assign the new assignee, please try again!`))
                    })

            }))
    }

    /**
     * This function is responsible to changing the task due date
     * @param postId
     * @param dueDate
     */
    changeTaskDueDate(postId: string, dueDate: string) {
        let postService = this.injector.get(PostService)
        let utilityService = this.injector.get(UtilityService)
        let managementPortalService = this.injector.get(ManagementPortalService)

        utilityService.asyncNotification($localize`:@@publicFunctions.pleaseWaitChangingTaskDueDate:Please wait we are changing the task due date...`,
            new Promise(async (resolve, reject) => {
                const isShuttleTasksModuleAvailable = await this.isShuttleTasksModuleAvailable();
                const isIndividualSubscription = await managementPortalService.checkIsIndividualSubscription();
                // Call HTTP Request to change the request
                postService.changeTaskDueDate(postId, dueDate, isShuttleTasksModuleAvailable, isIndividualSubscription)
                    .then((res) => {
                        resolve(utilityService.resolveAsyncPromise($localize`:@@publicFunctions.taskDueDAteChanged:Task due date changed to ${moment(dueDate).format('YYYY-MM-DD')}!`))
                    })
                    .catch(() => {
                        reject(utilityService.rejectAsyncPromise($localize`:@@publicFunctions.unableToChangeDueDate:Unable to change the due date, please try again!`))
                    })

            }))
    }

    /**
     * This function is responsible to changing the task status
     * @param postId
     * @param status
     */
    async changeTaskStatus(postId: string, status: string, userId: string, groupId: string) {

        // Post Service Instance
        let postService = this.injector.get(PostService)
        let managementPortalService = this.injector.get(ManagementPortalService)

        const isShuttleTasksModuleAvailable = await this.isShuttleTasksModuleAvailable();
        const isIndividualSubscription = await managementPortalService.checkIsIndividualSubscription();

        // Call HTTP Request to change the request
        return postService.changeTaskStatus(postId, status, userId, groupId, isShuttleTasksModuleAvailable, isIndividualSubscription);
    }

    /**
     * This function is responsible to changing the task column
     * @param postId
     * @param title
     */
    changeTaskColumn(postId: string, columnId: string, userId: string, groupId: string) {
        let postService = this.injector.get(PostService)
        let utilityService = this.injector.get(UtilityService)
        let managementPortalService = this.injector.get(ManagementPortalService)

        utilityService.asyncNotification($localize`:@@publicFunctions.pleaseWaitWeAreMovingTaskToSection:Please wait we are moving the task to a new section...`,
            new Promise(async (resolve, reject) => {
                const isShuttleTasksModuleAvailable = await this.isShuttleTasksModuleAvailable();
                const isIndividualSubscription = await managementPortalService.checkIsIndividualSubscription();
                // Call HTTP Request to change the request
                postService.changeTaskColumn(postId, columnId, userId, groupId, isShuttleTasksModuleAvailable, isIndividualSubscription)
                    .then((res) => {
                        resolve(utilityService.resolveAsyncPromise($localize`:@@publicFunctions.tasksMoved:Task moved`));
                    })
                    .catch(() => {
                        reject(utilityService.rejectAsyncPromise($localize`:@@publicFunctions.unableToMoveTask:Unable to move the task, please try again!`));
                    })

            }))
    }

    /**
     * This function is responsible to changing the task status
     * @param postId
     * @param status
     */
    async changeTaskShuttleStatus(postId: string, groupId: string, status: string) {
        let postService = this.injector.get(PostService);
        let managementPortalService = this.injector.get(ManagementPortalService);

        const isShuttleTasksModuleAvailable = await this.isShuttleTasksModuleAvailable();
        const isIndividualSubscription = await managementPortalService.checkIsIndividualSubscription();

        // Call HTTP Request to change the request
        return postService.selectShuttleStatus(postId, groupId, status, isShuttleTasksModuleAvailable, isIndividualSubscription);
    }

    /**
     * This function is responsible to changing the task column
     * @param postId
     * @param title
     */
    async changeTaskShuttleSection(postId: string, groupId: string, shuttleSectionId: string) {
        let postService = this.injector.get(PostService);
        let utilityService = this.injector.get(UtilityService);
        let managementPortalService = this.injector.get(ManagementPortalService);

        const isShuttleTasksModuleAvailable = await this.isShuttleTasksModuleAvailable();
        const isIndividualSubscription = await managementPortalService.checkIsIndividualSubscription();

        utilityService.asyncNotification($localize`:@@publicFunctions.plesaeWaitWeAreUpdaing:Please wait we are updating the contents...`, new Promise(async (resolve, reject) => {
          await postService.selectShuttleSection(postId, groupId, shuttleSectionId, isShuttleTasksModuleAvailable, isIndividualSubscription)
            .then(async (res) => {

              resolve(utilityService.resolveAsyncPromise($localize`:@@publicFunctions.detailsUpdated:Details updated!`));
            })
            .catch(() => {
              reject(utilityService.rejectAsyncPromise($localize`:@@publicFunctions.unableToUpdateDetails:Unable to update the details, please try again!`));
            });
        }));
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

    async sendError(err: Error) {
        let utilityService = this.injector.get(UtilityService)
        console.log('There\'s some unexpected error occurred, please try again!', err);
        utilityService.errorNotification(err.message);
    }

    async getAgoraGroupsNotJoined(workplaceId, userId) {
        let groupService = this.injector.get(GroupsService);
        return new Promise((resolve, reject) => {
            groupService.getAgoraGroupsNotJoined(workplaceId, userId).then((res) => {
                resolve(res['group']);
            }).catch((err) => {
                this.sendError(err);
                reject(err);
            })
        })
    }

    async joinAgora(groupId, userId) {
        let groupService = this.injector.get(GroupsService);
        let utilityService = this.injector.get(UtilityService);
        utilityService.asyncNotification($localize`:@@publicFunctions.joiningGroup:Joining Group...`, new Promise((resolve, reject) => {
            groupService.joinAgora(groupId, userId).then((res) => {
                resolve(utilityService.resolveAsyncPromise($localize`:@@publicFunctions.successfullyJoinedGroup:Successfully Joined Group`));
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

    async executedAutomationFlowsPropertiesFront(flows: any[], post: any, groupId: string, isCreationTaskTrigger?: boolean, shuttleIndex?: number) {
      const managementPortalService = this.injector.get(ManagementPortalService);
      const isIndividualSubscription = await managementPortalService.checkIsIndividualSubscription();

      if (!isIndividualSubscription) {
        if (flows && flows.length > 0) {
          let doTrigger = true;
            flows.forEach((flow, flowIndex) => {
              const steps = flow['steps'];
              if (steps && steps.length > 0) {
                steps.forEach(async (step, stepIndex) => {
                  doTrigger = this.doesTriggersMatch(step.trigger, post, groupId, isCreationTaskTrigger || false, shuttleIndex)
                  if (doTrigger) {
                    const childStatusTriggerIndex = step.trigger.findIndex(trigger => { return trigger.name.toLowerCase() == 'subtasks status'; });
                    post = await this.executeActionFlow(flows, flowIndex, stepIndex, post, childStatusTriggerIndex != -1, groupId, shuttleIndex);
                  }
                });
              } else {
                doTrigger = false;
              }
            });
        }
      }
      return post;
    }

    doesTriggersMatch(triggers: any[], post: any, groupId: string, isCreationTaskTrigger: boolean, shuttleIndex: number) {
        let retValue = true;
        if (triggers && triggers.length > 0) {
            triggers.forEach(async trigger => {
                if (retValue) {
                    switch (trigger.name) {
                        case 'Assigned to':
                            if (post.task._parent_task) {
                              retValue = false;
                            } else {
                              const usersMatch =
                                  trigger._user.filter((triggerUser) => {
                                      return post._assigned_to.findIndex(assignee => {
                                          return (assignee._id || assignee).toString() == (triggerUser._id || triggerUser).toString()
                                      }) != -1
                                  });
                              retValue = (usersMatch && usersMatch.length > 0);
                            }
                            return Promise.resolve({});
                        case 'Custom Field':
                            if (post.task._parent_task) {
                                retValue = false;
                            } else {
                              retValue = post.task.custom_fields[trigger.custom_field.name].toString() == trigger.custom_field.value.toString();
                            }
                            return Promise.resolve({});
                        case 'Section is':
                            if (post.task._parent_task) {
                                if (post?.task?.shuttle_type && (post?.task?._shuttle_group?._id || post?.task?._shuttle_group) == groupId) {
                                    const triggerSection = (trigger._section._id || trigger._section);
                                    const postSection = (post.task._shuttle_section._id || post.task._shuttle_section);
                                    retValue = triggerSection.toString() == postSection.toString();
                                } else {
                                    retValue = false;
                                }
                            } else {
                                const triggerSection = (trigger && trigger._section) ? (trigger._section._id || trigger._section) : '';
                                let postSection;
                                if (post?.task?.shuttle_type && (post?.task?._shuttle_group?._id || post?.task?._shuttle_group) == groupId) {
                                    postSection = (post.task._shuttle_section._id || post.task._shuttle_section);
                                } else if (post.task._column) {
                                    postSection = (post.task._column._id || post.task._column);
                                } else {
                                    postSection = '';
                                }
                                retValue = triggerSection.toString() == postSection.toString();
                            }
                            return Promise.resolve({});
                        case 'Status is':
                            if (post.task._parent_task) {
                                if (post?.task?.shuttle_type && shuttleIndex >= 0) {
                                    retValue = trigger.status.toUpperCase() == post.task.shuttles[shuttleIndex].shuttle_status.toUpperCase();
                                } else {
                                    retValue = false;
                                }
                            } else {
                                if (post?.task?.shuttle_type && shuttleIndex >= 0) {
                                    retValue = trigger.status.toUpperCase() == post.task.shuttles[shuttleIndex].shuttle_status.toUpperCase();
                                } else {
                                    retValue = trigger.status.toUpperCase() == post.task.status.toUpperCase();
                                }
                            }
                            return Promise.resolve({});
                        case 'Task is CREATED':
                            if (!post.task._parent_task && isCreationTaskTrigger) {
                                retValue = true;
                            }
                            return Promise.resolve({});
                        case 'Subtasks Status':
                            let postService = this.injector.get(PostService);
                            if (retValue && post.task._parent_task && trigger.subtaskStatus.toUpperCase() == post.task.status.toUpperCase()) {
                                postService.getSubTasks(post.task._parent_task._id || post.task._parent_task).then(res => {
                                    res['subtasks'].forEach(subtask => {
                                        if (retValue && subtask._id != post._id) {
                                            retValue = trigger.subtaskStatus.toUpperCase() == subtask.task.status.toUpperCase();
                                        }
                                    });
                                });
                            } else {
                                retValue = false;
                            }
                            return Promise.resolve({});
                        case 'Approval Flow is Completed':
                            if (post.approval_active && post.approval_flow_launched) {
                                retValue = await this.isApprovalFlowCompleted(post.approval_flow);
                            } else {
                              retValue = false;
                            }
                            break;
                        case 'Due date is':
                            const today = moment().startOf('day').format('YYYY-MM-DD');
                            if (((trigger?.due_date_value == 'overdue') && (post?.task?.status != 'done') && (moment.utc(post?.task?.due_to).format('YYYY-MM-DD') < today))
                                    || ((trigger?.due_date_value == 'today') && (moment.utc(post?.task?.due_to).isSame(today)))
                                    || ((trigger?.due_date_value == 'tomorrow') && (moment.utc(post?.task?.due_to).isSame(moment().startOf('day').add(1, 'days'))))) {
                                retValue = true;
                            }
                            break;
                        default:
                            retValue = true;
                            return Promise.resolve({});
                    }
                }
            });
        } else {
            retValue = false;
        }
        return retValue;
    }

    isApprovalFlowCompleted(flow) {
        for (let i = 0; i < flow.length; i++) {
            if (!flow[i].confirmed || !flow[i].confirmation_date) {
                return false;
            }
        }
        return true
    }

    async executeActionFlow(flows: any[], flowIndex: number, stepIndex: number, post: any, childTasksUpdated: boolean, groupId: string, shuttleIndex: number) {
        const isShuttleTasksModuleAvailable = await this.isShuttleTasksModuleAvailable();
        const shuttleActinIndex = flows[flowIndex].steps[stepIndex].action.findIndex(action => action.name == 'Shuttle task');
        const executeShuttleAction = (shuttleActinIndex < 0) || isShuttleTasksModuleAvailable;
        if (!childTasksUpdated && executeShuttleAction) {
            flows[flowIndex].steps[stepIndex].action.forEach(async action => {
                switch (action.name) {
                    case 'Assign to':
                        action._user.forEach(async userAction => {
                            const indexAction = post._assigned_to.findIndex(assignee => (assignee._id || assignee) == (userAction._id || userAction));
                            if (indexAction < 0) {
                                post._assigned_to.push(userAction);
                            }
                        });
                        return post;
                    case 'Custom Field':
                        post.task.custom_fields[action.custom_field.name] = action.custom_field.value;
                        return post;
                    case 'Move to':
                        if (post.task._parent_task) {
                          if (post?.task?.shuttle_type && shuttleIndex >= 0) {
                            post.task.shuttles[shuttleIndex]._shuttle_section = action._section;
                          }
                        } else {
                          if (post?.task?.shuttle_type && shuttleIndex >= 0) {
                            post.task.shuttles[shuttleIndex]._shuttle_section = action._section;
                          } else {
                            if (!post.task._parent_task) {
                              post.task._column = action._section;
                            }
                          }
                        }
                        return post;
                    case 'Change Status to':
                        if (post?.task?.shuttle_type && shuttleIndex >= 0) {
                          post.task.shuttles[shuttleIndex].shuttle_status = action.status;
                        } else {
                          post.task.status = action.status;
                        }
                        return post;
                    case 'Shuttle task':
                        if (!post?.task?.shuttle_type && shuttleIndex < 0) {
                          post.task.shuttle_type = true;
                          if (!post.task.shuttles) {
                            post.task.shuttles = [];
                          }
                          post.task.shuttles.unshift({
                            _shuttle_group: action?._shuttle_group,
                            _shuttle_section: action?._shuttle_group?._shuttle_section,
                            shuttle_status: 'to do',
                            shuttled_at: moment().format()
                          });
                        }
                        return Promise.resolve({});
                    case 'Set Due date':
                        if (shuttleIndex < 0) {
                          if (action?.due_date_value == 'tomorrow') {
                            post.task.due_to = moment().add(1,'days');
                          } else if (action?.due_date_value == 'end_of_week') {
                            post.task.due_to = moment().endOf('week').subtract(1,'days');
                          } else if (action?.due_date_value == 'end_of_next_week') {
                            post.task.due_to = moment().add(1,'weeks').endOf('week').subtract(1,'days');
                          } else if (action?.due_date_value == 'end_of_month') {
                            post.task.due_to = moment().endOf('month');
                          }
                        }
                        return post;
                    case 'Set Time Allocation to':
                        if (shuttleIndex < 0) {
                          post.task.allocation = action?.allocation;
                        }
                        return post;
                    default:
                        return post;
                }
            });
            return post;
        }
        return post;
    }

    async getCurrentGroupMembers() {
        const groupData = await this.getCurrentGroupDetails();
        let groupMembers = [];
        if (groupData['_admins'].length > 0) {
            groupData['_admins'].forEach(element => {
                groupMembers.push(element);
            });
        }
        if (groupData['_members'].length > 0) {
            groupData['_members'].forEach(element => {
                groupMembers.push(element);
            });
        }
        return groupMembers;
    }

    async isMobileDevice() {
      return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
    }

    /**
     * This method returns the highest date of the posts passed by parameter
     * @param posts
     * @returns
     */
    getHighestDate(posts: any) {
      const highestDate = moment(Math.max(...posts.map(post => moment(post.task.due_to))));
      return (!highestDate || !highestDate.isValid()) ? null : highestDate;
    }

    async checkFlamingoStatus(workspaceId: string, mgmtApiPrivateKey: string) {
      const managementPortalService = this.injector.get(ManagementPortalService);
      return managementPortalService.getFlamingoStatus(workspaceId, mgmtApiPrivateKey).then(
        (res) => {
          if ( !res || !res['status'] ) {
            return false;
          }
          return true;
        }).catch((err) => {
          return false;
        });
    }

    async checkIdeaStatus(workspaceId?: string, mgmtApiPrivateKey?: string) {
      let workspace;
      if (!workspaceId) {
        workspace = await this.getCurrentWorkspace();
        workspaceId = workspace?._id;
        mgmtApiPrivateKey = workspace?.management_private_api_key;
      }

      const managementPortalService = this.injector.get(ManagementPortalService);
      return managementPortalService.getIdeaStatus(workspaceId, mgmtApiPrivateKey).then(
        (res) => {
          if ( !res || !res['status'] ) {
            return false;
          }
          return true;
        }).catch((err) => {
          return false;
        });
    }

    async isShuttleTasksModuleAvailable() {
      const workspace: any = await this.getCurrentWorkspace();
      const managementPortalService = this.injector.get(ManagementPortalService);
      return managementPortalService.isShuttleTasksModuleAvailable(workspace?._id, workspace?.management_private_api_key).then(
        (res) => {
          if ( !res || !res['status'] ) {
            return false;
          }
          return true;
        }).catch((err) => {
          return false;
        });
    }

    /**
     * This function is responsible for fetching the status of the campaign module
     * @returns status
     */
    async isCampaignModuleAvailable() {
        const workspace: any = await this.getCurrentWorkspace()
        const managementPortalService = this.injector.get(ManagementPortalService);
        return managementPortalService.isExcelModuleAvailable(workspace?._id, workspace?.management_private_api_key).then(
          (res) => {
            if ( !res || !res['status'] ) {
              return false;
            }
            return true;
          }).catch((err) => {
            return false;
          });
    }

      /**
     * This function is responsible for fetching the status of the Files Versions module
     * @returns status
     */
    async isFilesVersionsModuleAvailable() {
        const workspace: any = await this.getCurrentWorkspace();
        const managementPortalService = this.injector.get(ManagementPortalService);
        return managementPortalService.isFilesVersionsModuleAvailable(workspace?._id, workspace?.management_private_api_key).then(
          (res) => {
            if ( !res || !res['status'] ) {
              return false;
            }
            return true;
          }).catch((err) => {
            return false;
          });
    }

      /**
     * This function is responsible for fetching the status of the Organization module
     * @returns status
     */
    async isOrganizationModuleAvailable() {
        const workspace: any = await this.getCurrentWorkspace();
        const managementPortalService = this.injector.get(ManagementPortalService);
        return managementPortalService.isOrganizationModuleAvailable(workspace?._id, workspace?.management_private_api_key).then(
          (res) => {
            if ( !res || !res['status'] ) {
              return false;
            }
            return true;
          }).catch((err) => {
            return false;
          });
    }

    /**
     * This function is responsible for fetching the status of the Chat module
     * @returns status
     */
    async isChatModuleAvailable() {
        const workspace: any = await this.getCurrentWorkspace();
        const managementPortalService = this.injector.get(ManagementPortalService);
        return managementPortalService.isChatModuleAvailable(workspace?._id, workspace?.management_private_api_key).then(
          (res) => {
            if ( !res || !res['status'] ) {
              return false;
            }
            return true;
          }).catch((err) => {
            return false;
          });
    }

    /**
     * This function is responsible for fetching the status of the Chat module
     * @returns status
     */
    async isLoungeModuleAvailable() {
        const workspace: any = await this.getCurrentWorkspace();
        const managementPortalService = this.injector.get(ManagementPortalService);
        return managementPortalService.isLoungeModuleAvailable(workspace?._id, workspace?.management_private_api_key).then(
          (res) => {
            if ( !res || !res['status'] ) {
              return false;
            }
            return true;
          }).catch((err) => {
            return false;
          });
    }

    /* Helper function fetching the worksapace groups
     * @param workspaceId - current workspaceId
     */
    getAllGroupsList(workspaceId: string) {
        return new Promise((resolve, reject) => {

            // Create groups service instance
            let groupsService = this.injector.get(GroupsService);

            // Fetch the groups from server
            groupsService.getAllGroupsList(workspaceId)
                .then((res) => {
                    // Resolve with sucess
                    resolve(res['groups'])
                })
                .catch(() => {
                    // If there's an error, then
                    reject([]);
                })
        })
    }

    /**
     * Helper function fetching the next workspace group
     * @param workspaceId - current workspaceId
     * @param lastWorkspaceId - lastWorkspaceId fetched from current groups array list
     */
     getNextAllGroupsList(workspaceId: string, lastWorkspaceId: string) {
        return new Promise((resolve, reject) => {

            // Create groups service instance
            let groupsService = this.injector.get(GroupsService);

            // Fetch the groups from server
            groupsService.getNextAllGroupsList(workspaceId, lastWorkspaceId)
                .then((res) => {
                    // Resolve with sucess
                    resolve(res['groups'])
                })
                .catch(() => {
                    // If there's an error, then
                    reject([]);
                })
        })
    }

    /**
     * Helper function fetching the worksapace groups
     * @param workspaceId - current workspaceId
     */
     getAllArchivedGroupsList(workspaceId: string) {
        return new Promise((resolve, reject) => {

            // Create groups service instance
            let groupsService = this.injector.get(GroupsService);

            // Fetch the groups from server
            groupsService.getAllArchivedGroupsList(workspaceId)
                .then((res) => {
                    // Resolve with sucess
                    resolve(res['groups'])
                })
                .catch(() => {
                    // If there's an error, then
                    reject([]);
                })
        })
    }

    /**
     * Helper function fetching the next workspace group
     * @param workspaceId - current workspaceId
     * @param lastWorkspaceId - lastWorkspaceId fetched from current groups array list
     */
     getNextAllArchivedGroupsList(workspaceId: string, lastWorkspaceId: string) {
        return new Promise((resolve, reject) => {

            // Create groups service instance
            let groupsService = this.injector.get(GroupsService);

            // Fetch the groups from server
            groupsService.getNextAllArchivedGroupsList(workspaceId, lastWorkspaceId)
                .then((res) => {
                    // Resolve with sucess
                    resolve(res['groups'])
                })
                .catch(() => {
                    // If there's an error, then
                    reject([]);
                })
        })
    }

    /**
     * This function is responsible for fetching the active groups present inside a workspace
     * @param workspaceId
     * @param query
     */
    searchWorkspaceActiveGroups(workspaceId: string, query: string) {
        try {
            return new Promise(async (resolve) => {

                // Create workspace service instance
                let groupsService = this.injector.get(GroupsService);

                // Fetch the active groups based on the query and workspaceId
                let groups = await groupsService.getWorkspaceActiveGroups(workspaceId, query)

                // Resolve with success
                resolve(groups)
            })

        } catch (err) {
            this.sendError(err);
        }
    }

    /**
     * This function is responsible for fetching the archived groups present inside a workspace
     * @param workspaceId
     * @param query
     */
    searchWorkspaceArchivedGroups(workspaceId: string, query: string) {
        try {
            return new Promise(async (resolve) => {

                // Create workspace service instance
                let groupsService = this.injector.get(GroupsService);

                // Fetch the archived groups based on the query and workspaceId
                let groups = await groupsService.getWorkspaceArchivedGroups(workspaceId, query)

                // Resolve with success
                resolve(groups)
            })

        } catch (err) {
            this.sendError(err);
        }
    }

    /**
     * This function checks the task board if a particular task is overdue or not
     * @param task
     * And applies the respective ng-class
     *
     * -----Tip:- Don't make the date functions asynchronous-----
     *
     */
    checkOverdue(taskPost: any) {
      // Today's date object
      const today = moment().startOf('day').format('YYYY-MM-DD');
      return (taskPost?.task?.status != 'done') &&
        (moment.utc(taskPost?.task?.due_to).format('YYYY-MM-DD') < today);
    }

    /**
     *
     * STARTING THE BLOCK OF METHODS TO UPDATE THE RIGHTS OF AN ITEM
     * ITEM = post/section/file/folder
     *
     */
    selectPermissionRight(permissionId: string, itemId: string, right: string, type: string) {
      switch (type) {
        case 'file':
          // Create service instance
          let filesService = this.injector.get(FilesService);
          return filesService.selectPermissionRight(permissionId, itemId, right);
        case 'folder':
          // Create service instance
          let foldersService = this.injector.get(FoldersService);
          return foldersService.selectPermissionRight(permissionId, itemId, right);
        case 'post':
          // Create service instance
          let postService = this.injector.get(PostService);
          return postService.selectPermissionRight(permissionId, itemId, right);
        case 'section':
          // Create service instance
          let columnService = this.injector.get(ColumnService);
          return columnService.selectPermissionRight(permissionId, itemId, right);
      }
    }

    removePermission(permissionId: string, itemId: string, type: string) {
      switch (type) {
        case 'file':
          // Create service instance
          let filesService = this.injector.get(FilesService);
          return filesService.removePermission(permissionId, itemId);
        case 'folder':
          // Create service instance
          let foldersService = this.injector.get(FoldersService);
          return foldersService.removePermission(permissionId, itemId);
        case 'post':
          // Create service instance
          let postService = this.injector.get(PostService);
          return postService.removePermission(permissionId, itemId);
        case 'section':
          // Create service instance
          let columnService = this.injector.get(ColumnService);
          return columnService.removePermission(permissionId, itemId);
      }
    }

    addTagToPermission(permissionId: string, itemId: string, tag: string, type: string) {
      switch (type) {
        case 'file':
          // Create service instance
          let filesService = this.injector.get(FilesService);
          return filesService.addTagToPermission(permissionId, itemId, tag);
        case 'folder':
          // Create service instance
          let foldersService = this.injector.get(FoldersService);
          return foldersService.addTagToPermission(permissionId, itemId, tag);
        case 'post':
          // Create service instance
          let postService = this.injector.get(PostService);
          return postService.addTagToPermission(permissionId, itemId, tag);
        case 'section':
          // Create service instance
          let columnService = this.injector.get(ColumnService);
          return columnService.addTagToPermission(permissionId, itemId, tag);
      }
    }

    removePermissionTag(permissionId: string, itemId: string, tag: string, type: string) {
      switch (type) {
        case 'file':
          // Create service instance
          let filesService = this.injector.get(FilesService);
          return filesService.removePermissionTag(permissionId, itemId, tag);
        case 'folder':
          // Create service instance
          let foldersService = this.injector.get(FoldersService);
          return foldersService.removePermissionTag(permissionId, itemId, tag);
        case 'post':
          // Create service instance
          let postService = this.injector.get(PostService);
          return postService.removePermissionTag(permissionId, itemId, tag);
        case 'section':
          // Create service instance
          let columnService = this.injector.get(ColumnService);
          return columnService.removePermissionTag(permissionId, itemId, tag);
      }
    }

    addMemberToPermission(itemId: string, permissionId: string, member: any, type: string) {
      switch (type) {
        case 'file':
          // Create service instance
          let filesService = this.injector.get(FilesService);
          return filesService.addMemberToPermission(itemId, permissionId, member);
        case 'folder':
          // Create service instance
          let foldersService = this.injector.get(FoldersService);
          return foldersService.addMemberToPermission(itemId, permissionId, member);
        case 'post':
          // Create service instance
          let postService = this.injector.get(PostService);
          return postService.addMemberToPermission(itemId, permissionId, member);
        case 'section':
          // Create service instance
          let columnService = this.injector.get(ColumnService);
          return columnService.addMemberToPermission(itemId, permissionId, member);
      }
    }

    removeMemberFromPermission(itemId: string, permissionId: string, memberId: string, type: string) {
      switch (type) {
        case 'file':
          // Create service instance
          let filesService = this.injector.get(FilesService);
          return filesService.removeMemberFromPermission(itemId, permissionId, memberId);
        case 'folder':
          // Create service instance
          let foldersService = this.injector.get(FoldersService);
          return foldersService.removeMemberFromPermission(itemId, permissionId, memberId);
        case 'post':
          // Create service instance
          let postService = this.injector.get(PostService);
          return postService.removeMemberFromPermission(itemId, permissionId, memberId);
        case 'section':
          // Create service instance
          let columnService = this.injector.get(ColumnService);
          return columnService.removeMemberFromPermission(itemId, permissionId, memberId);
      }
    }
    /**
     *
     * ENDS THE BLOCK OF METHODS TO UPDATE THE RIGHTS OF AN ITEM
     * ITEM = post/section/file/folder
     *
     */

    /**
     * Obtain the possible integrations from the workspaces in the DB
     */
    async getPossibleIntegrations() {

      const allWorkspacesIntegratinos: any = await this.getAllWorkspaces();
      let possibleIntegrations = {
        is_on_premise_environment: !(environment.clientUrl == 'app.octonius.com' || environment.clientUrl == 'workspace.octonius.com' || environment.clientUrl.includes('localhost')),
        is_google_connected: false,
        google_client_id: '',
        google_client_secret_key: '',
        is_azure_ad_connected: false,
        azure_ad_clientId: '',
        azure_ad_authority_cloud_url: '',
        is_ldap_connected: false
      }

      allWorkspacesIntegratinos.forEach(workspace => {
        if (workspace.integrations) {
          if (!possibleIntegrations.is_google_connected && workspace.integrations.is_google_connected) {
            possibleIntegrations.is_google_connected = workspace.integrations.is_google_connected;
            possibleIntegrations.google_client_id = workspace.integrations.google_client_id;
            possibleIntegrations.google_client_secret_key = workspace.integrations.google_client_secret_key;
          }
          if (!possibleIntegrations.is_azure_ad_connected && workspace.integrations.is_azure_ad_connected) {
            possibleIntegrations.is_azure_ad_connected = workspace.integrations.is_azure_ad_connected;
            possibleIntegrations.azure_ad_clientId = workspace.integrations.azure_ad_clientId;
            possibleIntegrations.azure_ad_authority_cloud_url = workspace.integrations.azure_ad_authority_cloud_url;
          }
          if (!possibleIntegrations.is_ldap_connected && workspace.integrations.is_ldap_connected) {
            possibleIntegrations.is_ldap_connected = workspace.integrations.is_ldap_connected;
          }
        }
      });

      return possibleIntegrations;
    }

    /**
     * This functions calls the auth service to obtain all with workplaces in the DB
     */
    async getAllWorkspaces() {
      const authService = this.injector.get(AuthService);
      return new Promise(async (resolve) => {
        await await authService.getAllWorkspacesIntegrations()
          .then((res) => {
            if (res) {
              resolve(res['workspace']);
            }
          })
      });
    }

    /**
     * This function is responsible for fetching the group members list
     * @param searchTerm: string
     * @param groupId: string
     * @param workspaceData: any
     */
    async suggestMembers(searchTerm: string, groupId: string, workspaceData: any) {

      // Fetch the users list from the server
      let usersList: any = [];
      if (groupId) {
        usersList = await this.searchGroupMembers(groupId, searchTerm)
      } else {
        usersList = await this.searchWorkspaceMembers(workspaceData?._id, searchTerm);
      }
      // Map the users list
      usersList = usersList['users'].map((user) => ({
        id: user._id,
        value: user.first_name + " " + user.last_name
      }))

      // Return the Array without duplicates
      return Array.from(new Set(usersList))
    }

    /**
     * This function is responsible for fetching the files list
     * @param searchTerm: string
     * @param groupId: string
     * @param workspaceData: any
     */
    async suggestFiles(searchTerm: string, groupId: string, workspaceData: any) {
      // Storage Service Instance
      let storageService = this.injector.get(StorageService);
      let utilityService = this.injector.get(UtilityService);
      let integrationsService = this.injector.get(IntegrationsService);

      // Fetch the users list from the server
      let filesList: any = [];
      if (groupId) {
        filesList = await this.searchFiles(groupId, searchTerm, 'true');
      } else {
        filesList = await this.searchFiles(null, searchTerm, 'true', workspaceData._id);
      }

      // Map the users list
      filesList = filesList.map((file: any) => ({
        id: file._id,
        value:
          (file.type == 'folio')
            ? `<a href="/document/${file._id}?readOnly=true" style="color: inherit" target="_blank">${file.original_name}</a>`
            : (file.type == "flamingo")
              ? `<a href="/document/flamingo/${file._id}" style="color: inherit" target="_blank">${file.original_name}</a>`
              : `<a href="${environment.UTILITIES_FILES_UPLOADS}/${workspaceData._id}/${file.modified_name}?authToken=Bearer ${storageService.getLocalData("authToken")["token"]}" style="color: inherit" target="_blank">${file.original_name}</a>`
      }));

      let googleFilesList: any = [];

      // Fetch Access Token
      if (storageService.existData('googleUser') && workspaceData?.integrations?.is_google_connected) {

        let googleUser: any = storageService.getLocalData('googleUser');

        if (utilityService.objectExists(googleUser)) {
          // Fetch the access token from the storage
          let accessToken = googleUser['accessToken']

          // Get Google file list
          googleFilesList = await integrationsService.searchGoogleFiles(searchTerm, accessToken) || []

          // Google File List
          if (googleFilesList.length > 0) {
            googleFilesList = googleFilesList.map((file: any) => ({
              id: '5b9649d1f5acc923a497d1da',
              value: '<a style="color:inherit;" target="_blank" href="' + file.embedLink + '"' + '>' + file.title + '</a>'
            }));
          }
        }
      }

      let boxFilesList: any = [];

      // Fetch Access Token
      if (storageService.existData('boxUser') && workspaceData?.integrations?.is_box_connected) {
        const boxUser: any = storageService.getLocalData('boxUser');

        if (utilityService.objectExists(boxUser)) {
          // Fetch the access token from the storage
          let boxAccessToken = boxUser['accessToken'];

          // Get Box file list
          boxFilesList = await integrationsService.searchBoxFiles(searchTerm, boxAccessToken, workspaceData?.integrations) || []

          // Box File List
          if (boxFilesList.length > 0) {
            boxFilesList = boxFilesList
                .filter(file => file && file.shared_link && file.shared_link.url)
                .map((file: any) => ({
                    id: 'boxfile',
                    value: '<a style="color:inherit;" target="_blank" href="' + file.shared_link.url + '"' + '>' + file.name + '</a>'
                  }));
          }
        }
      }

      let pagesList: any = await this.searchPages(groupId, searchTerm, workspaceData._id);

      // Map the users list
      pagesList = pagesList.map((file: any) => ({
        id: file._id,
        value: `<a href="/dashboard/work/groups/library/collection/page?page=${file._id}" style="color: inherit" target="_blank">${file.title}</a>`
      }));

      return Array.from(new Set([...filesList, ...googleFilesList, ...boxFilesList, ...pagesList]));
    }

    /**
     * This function is responsible for fetching the group members list
     * @param searchTerm: string
     * @param groupId: string
     * @param workspaceData: any
     */
    async suggestMembersForChat(searchTerm: string, chatData: any) {

      // Fetch the users list from the server
      let usersList: any = [];
      if (chatData._group) {
        usersList = await this.searchGroupMembers(chatData?._group?._id || chatData?._group, searchTerm);

        // Map the users list
        usersList = usersList['users'].map((user) => ({
          id: user._id,
          value: user.first_name + " " + user.last_name
        }));
      } else {

        usersList = await chatData?.members?.map(member => { return {
          _id: member._user._id,
          value: member._user.first_name + " " + member._user.last_name
        }}).filter(user => user.value.toUpperCase().includes(searchTerm.toUpperCase()));
      }

      // Return the Array without duplicates
      return Array.from(new Set(usersList))
    }

    async getUnreadChats() {
      const chatService = this.injector.get(ChatService);
      return new Promise(async (resolve) => {
        await await chatService.getUnreadChats()
          .then((res) => {
            if (res) {
              resolve(res['unreadChats'] || []);
            }
          });
      });
    }



  async filterRAGTasks(tasks: any, userData: any) {
    const utilityService = this.injector.get(UtilityService);
    let tasksTmp = [];

    if (tasks) {
      tasks = await tasks.filter(task => utilityService.objectExists(task?._group));
      // Filtering other tasks
      tasks.forEach(async task => {
        // if (utilityService.objectExists(task?._group)) {
          if (task?.permissions && task?.permissions?.length > 0) {
            const groupData = await this.getGroupDetails(task?._group?._id || task?._group);
            const canEdit = await utilityService.canUserDoTaskAction(task, groupData, userData, 'edit');
            let canView = false;
            if (!canEdit) {
              const hide = await utilityService.canUserDoTaskAction(task, groupData, userData, 'hide');
              canView = await utilityService.canUserDoTaskAction(task, groupData, userData, 'view') || !hide;
            }

            if (canEdit || canView) {
              task.canView = true;
              tasksTmp.push(task);
            }
          } else {
            task.canView = true;
            tasksTmp.push(task);
          }
        // }
      });
    }

    return tasksTmp;
  }

  convertQuillToHTMLContent(contentOps) {
    let converter = new QuillDeltaToHtmlConverter(contentOps, {});
    if (converter) {
      converter.renderCustomWith((customOp) => {
        // Conditionally renders blot of mention type
        if(customOp.insert.type === 'mention'){
          // Get Mention Blot Data
          const mention = customOp.insert.value;

          // Template Return Data
          return (
            `<span
              class="mention"
              data-index="${mention.index}"
              data-denotation-char="${mention.denotationChar}"
              data-link="${mention.link}"
              data-value='${mention.value}'>
              <span contenteditable="false">
                ${mention.value}
              </span>
            </span>`
          )
        }
      });
      // Convert into html
      return converter.convert();
    }

    return '';
  }
}
