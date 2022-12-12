import { Response, Request, NextFunction } from "express";
import { User } from '../models';
import { sendErr } from '../utils/sendError';
import { SearchService } from "../services/search.services";

const searchService = new SearchService();


export class SearchController {

  async getSearchResults(req: Request, res: Response, next: NextFunction) {
    try {
      const results = await searchService.getSearchResults(req, res);
      
      return res.status(200).json({
        message: 'successfully retrieved results',
        results
      });
    } catch(err) {
      return sendErr(res, new Error(err), 'Unable to fetch results.', 400)
    };
  };

  async searchTasksForNS(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req['userId'];
      let { query: {textQuery, groupId }} = req;

      if (!textQuery || textQuery == undefined || textQuery == 'undefined') {
        textQuery = '';
      }

      if (groupId == undefined || groupId == 'undefined') {
        groupId = null;
      }

      const results = await searchService.searchTasksForNS(userId, textQuery, groupId);
      
      return res.status(200).json({
        message: 'successfully retrieved results',
        results
      });
    } catch(err) {
      return sendErr(res, new Error(err), 'Unable to fetch results.', 400)
    };
  };
}
