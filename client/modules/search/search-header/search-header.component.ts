import { Component, OnInit, ElementRef, Injector } from '@angular/core';
import { SearchService } from 'src/shared/services/search-service/search.service';
import { PublicFunctions } from 'modules/public.functions';

@Component({
  selector: 'app-search-header',
  templateUrl: './search-header.component.html',
  styleUrls: ['./search-header.component.scss']
})
export class SearchHeaderComponent implements OnInit {


  searchedPosts = [];

  searchedUsers = [];

  searchedFiles = [];

  selected: any;

  searchQuery: string;

  selectedType: string;

  workplaceId: any;

  constructor(
    private searchService: SearchService,
    private injector: Injector
  ) { }

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector);

  async ngOnInit() {
    await this.publicFunctions.getCurrentUser().then((res)=>{
      this.workplaceId = res.workspace_name
    });
  }


  search() {
    this.searchedPosts = [];
    this.searchedUsers = [];
    this.searchedFiles = [];
    this.selected = null;
    this.selectedType = null;
    if (this.searchQuery=='' || this.searchQuery == " "){
      this.searchedPosts = [];
      this.searchedUsers = [];
      this.searchedFiles = [];
      this.selected = null;
      this.selectedType = null;
      return;
    }

    this.searchPosts(this.searchQuery);
    this.searchUsers(this.searchQuery);
    this.searchFiles(this.searchQuery);
  }

  /**
   * Post Query Starts
   */
  searchPosts(postQuery){
    try {
      new Promise(async (resolve, reject) => {
        await this.searchService.getSearchResults(postQuery, 'posts').then((res: any) => {
          if (res.results.length > 0) {
            const result = res.results.filter((restult) => this.searchedPosts.every((post) => post._id !== restult._id));
            result.forEach(post => {
              this.searchedPosts.push(post);
            });
          }
          resolve({});
        }).catch((err) => {
          reject();
        });

        let user: any;
        await this.publicFunctions.getCurrentUser().then(
          userResult => {
            user = userResult;
          }
        );
        await this.searchService.getSearchResults(postQuery, 'comments').then((res: any) => {
          if (res.results.length > 0) {
            const result = res.results.filter((restult) => this.searchedPosts.every((post) => post._id !== restult._post));
            result.forEach(comment => {
              if (user._groups.includes(comment.post[0]._group)) {
                this.searchedPosts.push(comment.post[0]);
              }
            });
          }
          resolve({});
        }).catch((err) => {
          reject();
        })
      });
    } catch (error) {

    }
  }
  /**
   * Post Query Ends
   */

  /**
   * User Query Starts
   */
  searchUsers(userQuery){
    try {
      new Promise((resolve, reject)=>{
        this.searchService.getSearchResults(userQuery, 'users').then((res: any) => {
          if (res.results.length > 0) {
            const result = res.results.filter((restult) => this.searchedUsers.every((user) => user._id !== restult._id));
            result.forEach(user => {
              this.searchedUsers.push(user);
            });
          }
          resolve({});
        }).catch((err)=>{
          reject();
        })
      })
    } catch (error) {

    }
  }
    /**
   * User Query Ends
   */

   /**
    * File Query Starts
    */
   searchFiles(fileQuery){
    try {
      new Promise((resolve, reject)=>{
        this.searchService.getSearchResults(fileQuery, 'files').then((res: any)=>{
          if (res.results.length > 0){
            const result = res.results.filter((restult) => this.searchedFiles.every((file) => file._id !== restult._id));
            result.forEach(file => {
              file['postedBy'] = file['postedBy'][0]['first_name'] + ' ' + file['postedBy'][0]['last_name'];
              file['groupName'] = file['group'][0]['group_name'];

              this.searchedFiles.push(file);
            });
          }
          resolve({});
        }).catch((err)=>{
          reject();
        })
      })
    } catch (error) {

    }
   }
   /**
    * File Query Ends
    */
}
