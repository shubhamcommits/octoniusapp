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

  workplaceData: any;

  showAdvancedFilters: boolean = false;

  advancedFilters: any = {
    type: 'all',
    owners: [],
    metadata: '',
    skills: [],
    tags: []
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
    this.searchedUsers = [];
    this.searchedFiles = [];
    this.selected = null;
    this.selectedType = null;

    if ((this.searchQuery=='' || this.searchQuery == " ")
        && this.advancedFilters.owners.length == 0
        && this.advancedFilters.skills.length == 0
        && this.advancedFilters.tags.length == 0
        && (this.advancedFilters.metadata == '' || this.advancedFilters.metadata == ' ')) {
      return;
    }

    if (this.advancedFilters.type == 'all' || this.advancedFilters.type == '' || this.advancedFilters.type == 'post') {
      this.searchPosts(this.searchQuery);
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

      let user: any;
      await this.publicFunctions.getCurrentUser().then(
        userResult => {
          user = userResult;
        }
      );
      await this.searchService.getSearchResults(postQuery, 'comments', this.advancedFilters).then((res: any) => {
        if (res.results.length > 0) {
          const result = res.results.filter((restult) => this.searchedPosts.every((post) => post._id !== restult._post));
          result.forEach(comment => {
            if (user._groups.includes(comment.post[0]._group)) {
              this.searchedPosts.push(comment.post[0]);
            }
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
}
