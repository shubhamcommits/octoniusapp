import { Response, Request, NextFunction } from "express";
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

  async searchAllGroupsList(req: Request, res: Response, next: NextFunction) {
    try {
      let { query: { query, groupId, workspaceId }} = req;

      if (!query || query == undefined || query == 'undefined') {
        query = '';
      }

      if (groupId == undefined || groupId == 'undefined') {
        groupId = null;
      }

      const groups = await searchService.searchAllGroupsList(workspaceId, query, groupId);

      return res.status(200).json({
        message: 'successfully retrieved results',
        groups
      });
    } catch(err) {
      return sendErr(res, new Error(err), 'Unable to fetch results.', 400)
    };
  };

  async searchAllUsersList(req: Request, res: Response, next: NextFunction) {
    try {
      let { query: { query, workspaceId }} = req;
      const userId = req['userId'];

      if (!query || query == undefined || query == 'undefined') {
        query = '';
      }

      const users = await searchService.searchAllUsersList(workspaceId, query, userId);

      return res.status(200).json({
        message: 'successfully retrieved results',
        users
      });
    } catch(err) {
      return sendErr(res, new Error(err), 'Unable to fetch results.', 400)
    };
  };
}
