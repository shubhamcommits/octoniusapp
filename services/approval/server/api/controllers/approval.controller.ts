import { Response, Request, NextFunction } from "express";
import { sendErr } from '../utils/sendError';
import { ApprovalService } from "../services/approval.services";

const approvalService = new ApprovalService();

export class ApprovalController {

  async activateApprovalForItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { body: { type, approval }, params: { itemId } } = req;
      const userId = req['userId'];
      
      if (!type || !itemId || !userId) {
        return sendErr(res, new Error('Please provide the itemId, userId and a type as the query parameter'), 'Please provide the itemId, userId and a type as the query paramater!', 400);
      }

      const item = await approvalService.activateApprovalForItem(itemId, type, approval, userId);
      
      return res.status(200).json({
        message: 'successfully retrieved results',
        item
      });
    } catch(err) {
      return sendErr(res, new Error(err), 'Unable to fetch results.', 400)
    };
  };

  async addUserToFlow(req: Request, res: Response, next: NextFunction) {
    try {
      const { body: { type, userId }, params: { itemId } } = req;

      if (!type || !itemId || !userId) {
        return sendErr(res, new Error('Please provide the itemId, userId and a type as the query parameter'), 'Please provide the itemId, userId and a type as the query paramater!', 400);
      }
      
      const item = await approvalService.addUserToFlow(itemId, type, userId);
      
      return res.status(200).json({
        message: 'successfully retrieved results',
        item
      });
    } catch(err) {
      return sendErr(res, new Error(err), 'Unable to fetch results.', 400)
    };
  };

  async removeUserFromFlow(req: Request, res: Response, next: NextFunction) {
    try {
      const { body: { type, approvalId }, params: { itemId } } = req;

      if (!type || !itemId || !approvalId) {
        return sendErr(res, new Error('Please provide the itemId, approvalId and a type as the query parameter'), 'Please provide the itemId, approvalId and a type as the query paramater!', 400);
      }
      
      const item = await approvalService.removeUserFromFlow(itemId, type, approvalId);
      
      return res.status(200).json({
        message: 'successfully retrieved results',
        item
      });
    } catch(err) {
      return sendErr(res, new Error(err), 'Unable to fetch results.', 400)
    };
  };

  async launchApprovalFlow(req: Request, res: Response, next: NextFunction) {
    try {
      const { body: { type, approval_flow_launched }, params: { itemId } } = req;
      const userId = req['userId'];
      
      if (!type || !itemId) {
        return sendErr(res, new Error('Please provide the itemId and a type as the query parameter'), 'Please provide the itemId and a type as the query paramater!', 400);
      }
      
      const item = await approvalService.launchApprovalFlow(itemId, type, approval_flow_launched, userId);
      
      return res.status(200).json({
        message: 'successfully retrieved results',
        item
      });
    } catch(err) {
      return sendErr(res, new Error(err), 'Unable to fetch results.', 400)
    };
  };

  async approveItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { body: { type, approvalId }, params: { itemId } } = req;

      if (!type || !itemId || !approvalId) {
        return sendErr(res, new Error('Please provide the itemId, approvalId and a type as the query parameter'), 'Please provide the itemId, approvalId and a type as the query paramater!', 400);
      }
      
      const item = await approvalService.approveItem(itemId, type, approvalId);
      
      return res.status(200).json({
        message: 'successfully retrieved results',
        item
      });
    } catch(err) {
      return sendErr(res, new Error(err), 'Unable to fetch results.', 400)
    };
  };

  async confirmAction(req: Request, res: Response, next: NextFunction) {
    try {
      const { body: { type, approvalId, code, description }, params: { itemId } } = req;
      const userId = req['userId'];

      if (!type || !itemId || !approvalId || !code || !userId) {
        return sendErr(res, new Error('Please provide the itemId, approvalId, code, userId and a type as the query parameter'), 'Please provide the itemId, approvalId, code, userId and a type as the query paramater!', 400);
      }
      
      const item = await approvalService.confirmAction(itemId, type, approvalId, code, description, userId);
      
      return res.status(200).json({
        message: 'successfully retrieved results',
        item
      });
    } catch(err) {
      return sendErr(res, new Error(err), 'Unable to fetch results.', 400)
    };
  };

  async rejectItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { body: { type, description }, params: { itemId } } = req;
      const userId = req['userId'];
      
      if (!type || !itemId || !description || !userId) {
        return sendErr(res, new Error('Please provide the itemId, description, userId and a type as the query parameter'), 'Please provide the itemId, approvalId, description, userId and a type as the query paramater!', 400);
      }
      
      const item = await approvalService.rejectItem(itemId, type, description, userId);
      
      return res.status(200).json({
        message: 'successfully retrieved results',
        item
      });
    } catch(err) {
      return sendErr(res, new Error(err), 'Unable to fetch results.', 400)
    };
  };
}
