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
  search_results_skills: any = new Array();
  more_to_load_skills = false;
  search_results_users: any = new Array();
  more_to_load_users = false;
  search_results_posts: any = new Array();
  more_to_load_posts = false;
  more_to_tag_load_posts = false

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
            this.search_results_users = [...this.search_results_users, ...res['results']['users']];
            this.more_to_load_users = res['results']['loadMoreUsers'];
            break;
          case 'posts':
            this.search_results_posts = [...this.search_results_posts, ...res['results']['posts']];
            this.more_to_load_posts = res['results']['loadMorePosts'];
            break;
          case 'skills':
            this.search_results_skills = [...this.search_results_skills, ...res['results']['skills']];
            this.more_to_load_skills = res['results']['loadMoreSkills'];
            break;
          case 'tags':
            this.search_results_posts = [...this.search_results_posts, ...res['results']];
            this.more_to_load_posts = res['results']['loadMoreSkills'];
          break;
        }
      });
  }

  getSearchResults() {
    if (this.search_value !== '') {
      this.searchService.getSearchResults(this.search_value, this.filter)
        .subscribe((res) => {
         // console.log('Search Results',this.filter,res);
          if (this.filter === 'all') {
            this.search_results_users = res['results']['users'];
            this.more_to_load_users = res['loadMoreUsers'];
            this.search_results_posts = res['results']['posts'];
            this.more_to_load_posts = res['loadMorePosts'];
            this.search_results_skills = res['results']['skills'];
            this.more_to_load_skills = res['loadMoreSkills'];
          } else if (this.filter === 'posts') {
            this.search_results_posts = res['results'];
            this.more_to_load_posts = res['moreToLoad'];
          } else if (this.filter === 'skills') {
            this.search_results_skills = res['results'];
            this.more_to_load_skills = res['moreToLoad'];
          } else if (this.filter === 'users') {
            this.search_results_users = res['results'];
            this.more_to_load_users = res['moreToLoad'];
          } else if (this.filter === 'tags') {
            this.search_results_posts = res['results'];
            this.more_to_tag_load_posts = res['moreToLoad'];
          }
        }, (err)=>{
          console.log('Error while searching', err);
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

  highlight(text, i) {
    var inputText = document.getElementById("postId-"+i);
    var innerHTML = inputText.innerHTML;
    var index = innerHTML.indexOf(text);
    if (index >= 0) { 
     innerHTML = innerHTML.substring(0,index) + "<span class='highlight'>" + innerHTML.substring(index,index+text.length) + "</span>" + innerHTML.substring(index + text.length);
     return inputText.innerHTML = innerHTML;
    }
  }


}
