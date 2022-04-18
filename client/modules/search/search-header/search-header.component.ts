import { Component, OnInit, ElementRef, Injector } from '@angular/core';
import { SearchService } from 'src/shared/services/search-service/search.service';
import { PublicFunctions } from 'modules/public.functions';
import moment from 'moment';

@Component({
  selector: 'app-search-header',
  templateUrl: './search-header.component.html',
  styleUrls: ['./search-header.component.scss']
})
export class SearchHeaderComponent implements OnInit {


  searchedPosts = [];
  searchedTasks = [];
  searchedUsers = [];
  searchedFiles = [];

  selected: any;

  searchQuery: string;

  selectedType: string;

  workplaceData: any;

  showAdvancedFilters: boolean = false;

  advancedFilters: any = {
    type: 'all',
    owners: [],
    metadata: '',
    skills: [],
    tags: [],
    from_date: null,
    to_date: null
  };

  // Public Functions Object
  public publicFunctions = new PublicFunctions(this.injector);

  constructor(
    private searchService: SearchService,
    private injector: Injector
  ) { }

  async ngOnInit() {

    this.workplaceData = await this.publicFunctions.getCurrentWorkspace();
  }

  search() {
    this.searchedPosts = [];
    this.searchedTasks = [];
    this.searchedUsers = [];
    this.searchedFiles = [];
    this.selected = null;
    this.selectedType = null;

    if ((this.searchQuery =='' || this.searchQuery == " ")
        && this.advancedFilters.owners.length == 0
        && this.advancedFilters.skills.length == 0
        && this.advancedFilters.tags.length == 0
        && (this.advancedFilters.metadata == '' || this.advancedFilters.metadata == ' ')
        && !this.advancedFilters.from_date
        && !this.advancedFilters.to_date) {
      return;
    }

    if (this.advancedFilters.type == 'all' || this.advancedFilters.type == '' || this.advancedFilters.type == 'post') {
      this.searchPosts(this.searchQuery);
    }

    if (this.advancedFilters.type == 'all' || this.advancedFilters.type == '' || this.advancedFilters.type == 'task') {
      this.searchTask(this.searchQuery);
    }

    if (this.advancedFilters.type == 'all' || this.advancedFilters.type == '' || this.advancedFilters.type == 'user') {
      this.searchUsers(this.searchQuery);
    }

    if (this.advancedFilters.type == 'all' || this.advancedFilters.type == '' || this.advancedFilters.type == 'file') {
      this.searchFiles(this.searchQuery);
    }
  }

  /**
   * Post Query Starts
   */
  async searchPosts(postQuery){
    try {
      await this.searchService.getSearchResults(postQuery, 'posts', this.advancedFilters).then((res: any) => {
        if (res.results.length > 0) {
          const result = res.results.filter((restult) => this.searchedPosts.every((post) => post._id !== restult._id));
          result.forEach(post => {
            this.searchedPosts.push(post);
          });
        }
      });
    } catch (error) {

    }
  }
  /**
   * Post Query Ends
   */

  /**
   * Task Query Starts
   */
  async searchTask(postQuery){
    try {
      await this.searchService.getSearchResults(postQuery, 'tasks', this.advancedFilters).then((res: any) => {
        if (res.results.length > 0) {
          const result = res.results.filter((restult) => this.searchedTasks.every((post) => post._id !== restult._id));
          result.forEach(post => {
            this.searchedTasks.push(post);
          });
        }
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
      this.searchService.getSearchResults(userQuery, 'users', this.advancedFilters).then((res: any) => {
        if (res.results.length > 0) {
          const result = res.results.filter((restult) => this.searchedUsers.every((user) => user._id !== restult._id));
          result.forEach(user => {
            this.searchedUsers.push(user);
          });
        }
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
      this.searchService.getSearchResults(fileQuery, 'files', this.advancedFilters).then((res: any)=>{
        if (res.results.length > 0){
          const result = res.results.filter((restult) => this.searchedFiles.every((file) => file._id !== restult._id));
          result.forEach(file => {
            this.searchedFiles.push(file);
          });
        }
      });
    } catch (error) {

    }
  }
  /**
  * File Query Ends
  */

  advancedFiltersTypeChanged() {
    this.advancedFilters.owners = [];
    this.advancedFilters.metadata = '';
    this.advancedFilters.skills = [];
    this.advancedFilters.tags = [];

    this.search();
  }

  addNewTag(tag: any) {
    this.advancedFilters?.tags?.push(tag);

    this.search();
  }

  removeTag(index) {
    this.advancedFilters?.tags?.splice(index, 1);

    this.search();
  }

  addNewSkill(skill) {
    this.advancedFilters?.skills?.push(skill);

    this.search();
  }

  removeSkill(index) {
    this.advancedFilters?.skills?.splice(index, 1);

    this.search();
  }

  addNewMember(event: any) {
    this.advancedFilters.owners.push({_id: event._id, profile_pic: event.profile_pic, first_name: event.first_name, last_name: event.last_name });

    this.search();
  }

  removeMemberSearch(memberId: string) {
    const index = (this.advancedFilters && this.advancedFilters.owners) ? this.advancedFilters.owners.findIndex(member => member._id == memberId) : -1;
    if (index >=0) {
      this.advancedFilters.owners.splice(index, 1);

      this.search();
    }
  }

  clear() {
    this.searchQuery = '';
    this.showAdvancedFilters = false;
    this.advancedFilters = {
      type: 'all',
      owners: [],
      metadata: '',
      skills: [],
      tags: [],
      from_date: null,
      to_date: null
    };
    this.searchedPosts = [];
    this.searchedTasks = [];
    this.searchedUsers = [];
    this.searchedFiles = [];
  }

  /**
   * This function is responsible for receiving the date from @module <app-date-picker></app-date-picker>
   * @param dateObject
   */
  getDate(dateObject: any, property: string) {
    if (property == 'from') {
      this.advancedFilters.from_date = (dateObject) ? dateObject.toDate() : '';
    }

    if (property == 'to') {
      this.advancedFilters.to_date = (dateObject) ? dateObject.toDate() : '';
    }

    this.search();
  }

  formateDate(date) {
    return (date) ? moment(moment.utc(date), "YYYY-MM-DD").toDate() : '';
  }
}
