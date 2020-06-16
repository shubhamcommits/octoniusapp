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


  search(){
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
    this.createPostQuery()
    this.createUserQuery();
    this.createFileQuery();
  }


  /**
   * Post query Starts
   */
  createPostQuery(){

    class PostQuery{
      conditions = [];
      sortList = [];

      PostQuery(){}
    }

    var postQuery = new PostQuery();
    var conditions = [{
      "columnName": "workspace",
      "conditionOperator": "EQUAL",
      "value": this.workplaceId
    }];
    conditions.push({
      "columnName": "id",
      "conditionOperator": "EQUAL",
      "value": this.searchQuery
    });
    postQuery.conditions = conditions;
    postQuery.sortList.push({
      "columnName": "title",
      "sortDirection": "desc"
    });
    this.searchPosts(postQuery);
    conditions = [{
      "columnName": "workspace",
      "conditionOperator": "EQUAL",
      "value": this.workplaceId
    }];
    conditions.push({
      "columnName": "title",
      "conditionOperator": "CONTAINS",
      "value": this.searchQuery
    });
    postQuery.conditions = conditions;
    this.searchPosts(postQuery);
    conditions = [{
      "columnName": "workspace",
      "conditionOperator": "EQUAL",
      "value": this.workplaceId
    }];
    conditions.push({
      "columnName": "content",
      "conditionOperator": "CONTAINS",
      "value": this.searchQuery
    });
    postQuery.conditions = conditions;
    this.searchPosts(postQuery);
    conditions = [{
      "columnName": "workspace",
      "conditionOperator": "EQUAL",
      "value": this.workplaceId
    }];
    conditions.push({
      "columnName": "attachedTags",
      "conditionOperator": "IN",
      "value": [this.searchQuery]
    });
    postQuery.conditions = conditions;
    this.searchPosts(postQuery);
  }


  searchPosts(postQuery){
    try {
      new Promise((resolve, reject)=>{
        this.searchService.searchPostByQuery(postQuery).then((res: any)=>{
          if (res.content.length > 0){
            for (let post of res.content){
              var found = false;
              for (let item of this.searchedPosts) if (item.id == post.id) {found = true; break;}
              if (found == false)this.searchedPosts.push(post);
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
   * Post Query Ends
   */



   /**
    * File Query Starts
    */
   createFileQuery(){

    class FileQuery{
      conditions = [];
      sortList = [];

      FileQuery(){};
    }

    var fileQuery = new FileQuery();
    var conditions = [{
      "columnName": "workspace",
      "conditionOperator": "EQUAL",
      "value": this.workplaceId
    }];
    conditions.push({
      "columnName": "id",
      "conditionOperator": "EQUAL",
      "value": this.searchQuery
    });
    fileQuery.conditions = conditions;
    fileQuery.sortList.push({
      "columnName": "originalFileName",
      "sortDirection": "desc"
    });
    this.searchFiles(fileQuery);
    conditions = [{
      "columnName": "workspace",
      "conditionOperator": "EQUAL",
      "value": this.workplaceId
    }];
    conditions.push({
      "columnName": "originalFileName",
      "conditionOperator": "CONTAINS",
      "value": this.searchQuery
    });
    fileQuery.conditions = conditions;
    this.searchFiles(fileQuery);
    conditions = [{
      "columnName": "workspace",
      "conditionOperator": "EQUAL",
      "value": this.workplaceId
    }];
    conditions.push({
      "columnName": "modifiedFileName",
      "conditionOperator": "CONTAINS",
      "value": this.searchQuery
    });
    fileQuery.conditions = conditions;
    this.searchFiles(fileQuery);
    conditions = [{
      "columnName": "workspace",
      "conditionOperator": "EQUAL",
      "value": this.workplaceId
    }];
    conditions.push({
      "columnName": "group",
      "conditionOperator": "CONTAINS",
      "value": this.searchQuery
    });
    fileQuery.conditions = conditions;
    this.searchFiles(fileQuery);
    conditions = [{
      "columnName": "workspace",
      "conditionOperator": "EQUAL",
      "value": this.workplaceId
    }];
    conditions.push({
      "columnName": "mimeType",
      "conditionOperator": "CONTAINS",
      "value": this.searchQuery
    });
    fileQuery.conditions = conditions;
    this.searchFiles(fileQuery);
    conditions = [{
      "columnName": "workspace",
      "conditionOperator": "EQUAL",
      "value": this.workplaceId
    }];
    conditions.push({
      "columnName": "postedBy",
      "conditionOperator": "CONTAINS",
      "value": this.searchQuery
    });
    fileQuery.conditions = conditions;
    this.searchFiles(fileQuery);
    conditions = [{
      "columnName": "workspace",
      "conditionOperator": "EQUAL",
      "value": this.workplaceId
    }];
    conditions.push({
      "columnName": "content",
      "conditionOperator": "CONTAINS",
      "value": this.searchQuery
    });
    fileQuery.conditions = conditions;
    this.searchFiles(fileQuery);
   }


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


    /**
     * User Query Starts
     */

    createUserQuery(){

      class UserQuery{
        conditions = [];
        sortList = [];
  
        UserQuery(){};
      }
  
      var userQuery = new UserQuery();
      var conditions = [{
        "columnName": "workspace",
        "conditionOperator": "EQUAL",
        "value": this.workplaceId
      }];
      conditions.push({
        "columnName": "id",
        "conditionOperator": "EQUAL",
        "value": this.searchQuery
      });
      userQuery.conditions = conditions;
      userQuery.sortList.push({
        "columnName": "fullName",
        "sortDirection": "desc"
      });
      this.searchUsers(userQuery);
      conditions = [{
        "columnName": "workspace",
        "conditionOperator": "EQUAL",
        "value": this.workplaceId
      }];
      conditions.push({
        "columnName": "fullName",
        "conditionOperator": "CONTAINS",
        "value": this.searchQuery
      });
      userQuery.conditions = conditions;
      this.searchUsers(userQuery);
      conditions = [{
        "columnName": "workspace",
        "conditionOperator": "EQUAL",
        "value": this.workplaceId
      }];
      conditions.push({
        "columnName": "email",
        "conditionOperator": "CONTAINS",
        "value": this.searchQuery
      });
      userQuery.conditions = conditions;
      this.searchUsers(userQuery);
      conditions = [{
        "columnName": "workspace",
        "conditionOperator": "EQUAL",
        "value": this.workplaceId
      }];
      conditions.push({
        "columnName": "userSkills",
        "conditionOperator": "IN",
        "value": [this.searchQuery]
      });
      userQuery.conditions = conditions;
      this.searchUsers(userQuery);
     }
  
  
     searchUsers(userQuery){
      try {
        new Promise((resolve, reject)=>{
          this.searchService.searchUserByQuery(userQuery).then((res: any)=>{
            if (res.content.length > 0){
              for (let user of res.content){
                var found = false;
                for (let item of this.searchedUsers) if (item.id == user.id) {found = true; break;}
                if (found == false)this.searchedUsers.push(user);
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
     * User Query Ends
     */

}
