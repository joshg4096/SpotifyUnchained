/* eslint-disable camelcase */
'use strict';

/**
 * Module dependencies.
 */
import {prop} from '@typegoose/typegoose';

export class Track {
  @prop({default: Date.now})
  public created?: Date;

  @prop()
  public id?: string;

  @prop()
  public name?: string;

  @prop()
  public artist?: string;

  @prop()
  public open_url?: string;

  @prop()
  public uri?: string;

  @prop()
  public added_at?: Date;
}

export class Playlist {
  @prop()
  public title?: string;

  @prop({default: Date.now})
  // eslint-disable-next-line camelcase
  public published_date?: Date;

  @prop({type: Track})
  public tracks?: Track[];
}
