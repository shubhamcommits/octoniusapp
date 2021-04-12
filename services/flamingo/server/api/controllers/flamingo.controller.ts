import { Response, Request, NextFunction } from "express";
import { User, Auth, Post, Group, Column } from '../models'
import jwt from "jsonwebtoken";
import { Auths, sendError } from '../../utils';
import axios from 'axios'
// Creating Service class in order to build wrapper class

/*  ===============================
 *  -- FLAMINGO CONTROLLERS --
 *  ===============================
 */
// Authentication Utilities Class
const auths = new Auths();

export class FlamingoController {

    /** 
     * This function is responsible to flamingo form
     * @param req 
     * @param res 
     * @param next 
     */
    async createForm(req: Request, res: Response, next: NextFunction) {
        res.status(200).json({message:"Success"})
    }
}
