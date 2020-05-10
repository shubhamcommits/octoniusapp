import { Component, OnInit, ElementRef } from '@angular/core';
import { UtilityService } from 'src/shared/services/utility-service/utility.service';
import { SearchService } from 'src/shared/services/search-service/search.service';

@Component({
  selector: 'app-search-header',
  templateUrl: './search-header.component.html',
  styleUrls: ['./search-header.component.scss']
})
export class SearchHeaderComponent implements OnInit {


  searchedPosts = [];

  searchedUsers = [];

  searchedFiles = [];

  selected: string;

  searchQuery: string;

  selectedType: string;

  constructor(
    private utilityService: UtilityService,
    private searchService: SearchService
  ) { }

  ngOnInit() {
    
  }


  search(){
    this.searchedPosts = [];
    this.searchedUsers = [];
    this.searchedFiles = [];
    this.selected = undefined;
    this.selectedType = undefined;
    if (this.searchQuery=='')return;
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
    var conditions = [];
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
    conditions = [];
    conditions.push({
      "columnName": "title",
      "conditionOperator": "CONTAINS",
      "value": this.searchQuery
    });
    postQuery.conditions = conditions;
    this.searchPosts(postQuery);
    conditions = [];
    conditions.push({
      "columnName": "content",
      "conditionOperator": "CONTAINS",
      "value": this.searchQuery
    });
    postQuery.conditions = conditions;
    this.searchPosts(postQuery);
  }


  searchPosts(postQuery){
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
    var conditions = [];
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
    conditions = [];
    conditions.push({
      "columnName": "originalFileName",
      "conditionOperator": "CONTAINS",
      "value": this.searchQuery
    });
    fileQuery.conditions = conditions;
    this.searchFiles(fileQuery);
    conditions = [];
    conditions.push({
      "columnName": "modifiedFileName",
      "conditionOperator": "CONTAINS",
      "value": this.searchQuery
    });
    fileQuery.conditions = conditions;
    this.searchFiles(fileQuery);
    conditions = [];
    conditions.push({
      "columnName": "group",
      "conditionOperator": "CONTAINS",
      "value": this.searchQuery
    });
    fileQuery.conditions = conditions;
    this.searchFiles(fileQuery);
    conditions = [];
    conditions.push({
      "columnName": "mimeType",
      "conditionOperator": "CONTAINS",
      "value": this.searchQuery
    });
    fileQuery.conditions = conditions;
    this.searchFiles(fileQuery);
    conditions = [];
    conditions.push({
      "columnName": "postedBy",
      "conditionOperator": "CONTAINS",
      "value": this.searchQuery
    });
    fileQuery.conditions = conditions;
    this.searchFiles(fileQuery);
    conditions = [];
    conditions.push({
      "columnName": "content",
      "conditionOperator": "CONTAINS",
      "value": this.searchQuery
    });
    fileQuery.conditions = conditions;
    this.searchFiles(fileQuery);
   }


   searchFiles(fileQuery){
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
      var conditions = [];
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
      conditions = [];
      conditions.push({
        "columnName": "username",
        "conditionOperator": "CONTAINS",
        "value": this.searchQuery
      });
      userQuery.conditions = conditions;
      this.searchUsers(userQuery);
      conditions = [];
      conditions.push({
        "columnName": "fullName",
        "conditionOperator": "CONTAINS",
        "value": this.searchQuery
      });
      userQuery.conditions = conditions;
      this.searchUsers(userQuery);
      conditions = [];
      conditions.push({
        "columnName": "email",
        "conditionOperator": "CONTAINS",
        "value": this.searchQuery
      });
      userQuery.conditions = conditions;
      this.searchUsers(userQuery);
     }
  
  
     searchUsers(userQuery){
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
     }

}
