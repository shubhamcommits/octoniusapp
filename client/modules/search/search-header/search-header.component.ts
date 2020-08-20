import { Component, OnInit, ElementRef, Injector } from '@angular/core';
import { SearchService } from 'src/shared/services/search-service/search.service';
import { PublicFunctions } from 'src/app/dashboard/public.functions';

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

  publicFunction = new PublicFunctions(this.injector);

  async ngOnInit() {
    await this.publicFunction.getCurrentUser().then((res)=>{
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

    // this.createPostQuery()
    // this.createUserQuery();
    // this.createFileQuery();
  }

  /**
   * Post Query Starts
   */
  searchPosts(postQuery){
    try {
      new Promise((resolve, reject)=>{
        this.searchService.getSearchResults(postQuery, 'posts').then((res: any) => {
          if (res.results.length > 0) {
            const result = res.results.filter((restult) => this.searchedPosts.every((post) => post._id !== restult._id));
            result.forEach(post => {
              this.searchedPosts.push(post);
            });
          }
          resolve();
        }).catch((err) => {
          reject();
        })
      })
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
          resolve();
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
    *
   searchFiles(fileQuery){
    try {
      new Promise((resolve, reject)=>{
        this.searchService.searchFileByQuery(fileQuery).then((res: any)=>{
          if (res.content.length > 0){
            for (let file of res.content){
              var found = false;
              for (let item of this.searchedFiles) if (item.id == file.id) {found = true; break;}
              if (found == false)this.searchedFiles.push(file);
            }
          }
          resolve();
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
