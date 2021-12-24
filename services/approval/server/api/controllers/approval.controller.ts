import { Response, Request, NextFunction } from "express";
import { sendErr } from '../utils/sendError';
import { ApprovalService } from "../services/approval.services";

const approvalService = new ApprovalService();

export class ApprovalController {

  async getSearchResults(req: Request, res: Response, next: NextFunction) {
    try {
      const results = await approvalService.getSearchResults(req, res);
      
      return res.status(200).json({
        message: 'successfully retrieved results',
        results
      });
    } catch(err) {
      return sendErr(res, new Error(err), 'Unable to fetch results.', 400)
    };
  };
}
