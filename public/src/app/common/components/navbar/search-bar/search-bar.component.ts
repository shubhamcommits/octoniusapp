import {Component, Input, OnInit} from '@angular/core';
import {SearchService} from "../../../../shared/services/search.service";
import {Router} from "@angular/router";

@Component({
  selector: 'search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss']
})
export class SearchBarComponent implements OnInit {

  @Input('user') user;

  user_data;

  // search data
  search_value = '';
  checked_filter = 'all';

  // search results
  search_results = [];
  search_results_posts = [];
  search_results_users = [];
  search_results_skills = [];
  recent_searches = [];

  constructor(private searchService: SearchService, private router: Router) {
    this.user_data = JSON.parse(localStorage.getItem('user'));
  }

  ngOnInit() {
  }

  loadRecentSearches() {
    if (this.search_value === '') {
      this.searchService.loadRecentSearches()
        .subscribe((res) => {
          this.recent_searches = res['searches'];
          console.log('recent_searches', this.recent_searches);
        });
    }
  }

  deleteSearchResult(data) {
    this.searchService.deleteSearchResult(data)
      .subscribe( (res) => {
        console.log('data', data);
        this.recent_searches = this.recent_searches.filter((search) => {
          if (data.type === 'user') {
            return search.user._id != data.user._id;
          } else if (data.type === 'content') {
            return search.content._id != data.content._id;
          }
        });
      });
  }

  displayAllSearchResults() {
    if (this.search_value !== '') {
      this.router.navigateByUrl(`/dashboard/all-search-results/${this.search_value}`);
    }
  }

  saveSearch(data) {
    this.searchService.saveSearch(data)
      .subscribe((res) => {
        console.log('RES', res);
      });
  }

  search() {
    if (this.search_value !== '') {
      const filter = this.checked_filter;
      this.search_results = [];
      const data = {
        query: this.search_value,
        filter
      };

      // yes
      this.searchService.search(data)
        .debounceTime(300)
        .subscribe((res) => {
          console.log('RES SKILLS', res);
          if (filter === 'users') {
            this.search_results_users = res['results'];
          } else if (filter === 'skills') {
            this.search_results_skills = res['results'];
          } else if (filter === 'posts') {
            this.search_results_posts = res['results'];
          } else {
            this.search_results_users = res['results'][0];
            this.search_results_posts = res['results'][1];
            console.log('POSTS', this.search_results_posts);
            this.search_results_skills = res['results'][2];
          }
        });
    } else {
      this.loadRecentSearches();
    }
  }

  resetSearchResults() {
    this.search_results_skills = [];
    this.search_results_posts = [];
    this.search_results_users = [];
  }

  toggleCheckbox(type) {
    this.checked_filter = this.checked_filter === type ? 'all' : type;
    this.resetSearchResults();
    this.search();
  }

}
