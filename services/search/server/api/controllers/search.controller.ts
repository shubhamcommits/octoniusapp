import { Response, Request, NextFunction } from "express";
import { User } from '../models';
import { sendErr } from '../utils/sendError';
import { SearchService } from "../services/search.services";

const searchService = new SearchService();


export class SearchController {

  async getSearchResults(req: Request, res: Response, next: NextFunction) {
    await searchService.getSearchResults(req, res).then((results) => {
      res.status(200).json({
        message: 'successfully retrieved results',
        results
      });
    })
    .catch((err) => {
        return sendErr(res, new Error(err), 'Unable to fetch results.', 400)
    });
  };

  /*
  async loadMoreResults(req: Request, res: Response, next: NextFunction) {
    const results = await searchService.getSearchResults(req, res, req.params.amountLoaded);

    res.status(200).json({
      message: 'successfully retrieved next results',
      results
    });
  };

  // SEARCH BAR
  async deleteSearchResult(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findOne({ _id: req['_id'] });

      // use this until you find the right mongodb way to do it
      user['search_history'] = user['search_history'].filter((search) => {
        if (req.body.type === 'user') {
          return req.body.user._id != search.user._id;
        } if (req.body.type === 'content') {
          return req.body.content._id != search.content._id;
        }
      });

      await user.save();

      return res.status(200).json({
        message: 'successfully deleted the search result'
      });
    } catch (err) {
      sendErr(res, err);
    }
  };

  async loadRecentSearches(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await User.findOne({ _id: req['_id'] });

      // get the 5 most recent searches
      const recentSearches = user['search_history'].slice(-5).reverse();

      res.status(200).json({
        message: 'successfully retrieved the searches',
        searches: recentSearches
      });
    } catch (err) {
      sendErr(res, err);
    }
  };

  async saveSearch(req: Request, res: Response, next: NextFunction) {
    try {
      // add the search of the user to the search results
      const user = await User.findOne({ _id: req['_id'] });

      user['search_history'].forEach((search, index) => {
        if (search[search['type']]._id == req.body[req.body['type']]._id) {
          user['search_history'].splice(index, 1);
        }
      });

      user['search_history'].push(req.body);

      await user.save();

      res.status(200).json({
        message: 'successfully saved your search'
      });
    } catch (err) {
      sendErr(res, err);
    }
  };

  async searchNav(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await searchService.getSearchResults(req, res, req.params.amountLoaded);
      const results = result['results'];

      res.status(200).json({
        message: 'Successfully loaded search results',
        results
      });
    } catch (err) {
      return sendErr(res, err);
    }
  };

  async getSkillsSearchResults(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await searchService.getSkillsSearchResults(req, res, req.params.amountLoaded);
      const results = result.results;
      const moreToLoad = result.moreToLoad;

      res.status(200).json({
        message: 'Successfully loaded search results',
        results,
        moreToLoad
      });
    } catch (err) {
      return sendErr(res, err);
    }
  };

  async getTagsSearchResults(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await searchService.getTagsSearchResults(req, res, req.params.amountLoaded);
      const results = result.results;
      const moreToLoad = result.moreToLoad;

      res.status(200).json({
        message: 'Successfully loaded search results',
        results,
        moreToLoad
      });
    } catch (err) {
      return sendErr(res, err);
    }
  };
  */
}
