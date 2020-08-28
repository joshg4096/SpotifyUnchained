import express, {Request, Response, NextFunction} from 'express';
import {PlayListController} from '../controllers/playlist';

const playListController = PlayListController.getInstance();

// eslint-disable-next-line new-cap
export const indexRouter = express.Router();

indexRouter.get('/', (req: Request, res: Response) => {
  playListController.list(req, res);
});
