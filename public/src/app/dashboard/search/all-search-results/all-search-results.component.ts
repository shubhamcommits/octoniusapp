import { Component, OnInit } from '@angular/core';
import {SearchService} from "../../../shared/services/search.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-all-search-results',
  templateUrl: './all-search-results.component.html',
  styleUrls: ['./all-search-results.component.scss']
})
export class AllSearchResultsComponent implements OnInit {

  user_data;

  filter = 'all';

  // search results
  search_value = '';
  search_results_skills = [];
  more_to_load_skills = false;
  search_results_users = [];
  more_to_load_users = false;
  search_results_posts = [];
  more_to_load_posts = false;

  constructor(private searchService: SearchService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.user_data = JSON.parse(localStorage.getItem('user'));
    this.search_value = 'ke';

    this.route.params.subscribe((params) => {
      this.search_value = params.query;
      this.filter = 'all';
      this.getSearchResults();
    });
  }

  changeFilter(filter) {
    this.filter = filter;
    this.resetSearchResults();
    this.getSearchResults();
  }

  loadMoreResults(type, amountLoaded) {
    this.searchService.loadMoreResults(type, amountLoaded, this.search_value)
      .subscribe((res) => {
        console.log('RES', res);
        switch (type) {
          case 'users':
            this.search_results_users = [...this.search_results_users, ...res['results']['results']];
            this.more_to_load_users = res['results']['moreToLoad'];
            break;
          case 'posts':
            this.search_results_posts = [...this.search_results_posts, ...res['results']['results']];
            this.more_to_load_posts = res['results']['moreToLoad'];
            break;
          case 'users':
            this.search_results_skills = [...this.search_results_skills, ...res['results']['results']];
            this.more_to_load_skills = res['results']['moreToLoad'];
            break;
        }
      });
  }

  getSearchResults() {
    if (this.search_value !== '') {
      this.searchService.getSearchResults(this.search_value, this.filter)
        .subscribe((res) => {
          if (this.filter === 'all') {
            this.search_results_users = res['results'][0];
            this.more_to_load_users = res['moreToLoad'][0];
            this.search_results_posts = res['results'][1];
            this.more_to_load_posts = res['moreToLoad'][1];
            this.search_results_skills = res['results'][2];
            this.more_to_load_skills = res['moreToLoad'][2];
          } else if (this.filter === 'posts') {
            this.search_results_posts = res['results'];
            this.more_to_load_users = res['moreToLoad'];
          } else if (this.filter === 'skills') {
            this.search_results_skills = res['results'];
            this.more_to_load_posts = res['moreToLoad'];
          } else if (this.filter === 'users') {
            this.search_results_users = res['results'];
            this.more_to_load_skills = res['moreToLoad'];
          }
        });
    }
  }

  resetSearchResults() {
    this.search_results_skills = [];
    this.search_results_posts = [];
    this.search_results_users = [];
    this.more_to_load_skills = false;
    this.more_to_load_posts = false;
    this.more_to_load_users = false;
  }


}
