'use strict';

/**
 * Module dependencies.
 */

import {Request, Response} from 'express';
import moment from 'moment';
import {ErrorHandler} from './error';
import {getModelForClass} from '@typegoose/typegoose';

import {Playlist as PlaylistClass, Track} from '../models/playlist';

export class PlayListController {

  private static instance: PlayListController;
  private Playlist = getModelForClass(PlaylistClass);

  private constructor() {

  }

  public static getInstance(): PlayListController {
    return this.instance || (this.instance = new this());
  }

  private static getNewFridayTitle(): string {
    return 'New.Music.Friday.' + PlayListController.getRecentFriday();
  }

  private static getRecentFriday(): string {
    return moment()
        .subtract(5, 'days')
        .startOf('week')
        .add(5, 'days')
        .format('MM.DD.YYYY');
  }

  public async create(tracks: Track[]): Promise<void> {
    const playlist = new this.Playlist(tracks);

    playlist.title = PlayListController.getNewFridayTitle();
    playlist.tracks = tracks;

    const upsertData = playlist.toObject();

    delete upsertData._id;

    try {
      await this.Playlist.updateOne({
        title: playlist.title,
      }, upsertData, {
        upsert: true,
      });
      console.log('Saved ' + playlist.title);
    }
    catch (err) {
      console.error(err);
    }
  }

  public list(this, req: Request, res: Response): void {
    // TODO: lodash numbers
    const pagesize = Number(req.query.size) || 5;
    const page = Number(req.query.page) || 1;
    const sort = req.query.sort || 'asc';

    const sortKey = sort === 'asc' ? 'published_date' : '-published_date';

    Promise.all([
      this.Playlist.countDocuments(),
      this.Playlist.find().sort(sortKey).skip(pagesize * (page - 1))
        .limit(Number(pagesize))
    ]).then(([count, playlists]) => {
      res.json({
        count,
        items: playlists,
      });
    }).catch((err) => {
      console.log(err);
      return res.status(400).send({
        message: ErrorHandler.getErrorMessage(err),
      });
    });
  }
}

