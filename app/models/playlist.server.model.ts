'use strict';

/**
 * Module dependencies.
 */
import { prop } from '@typegoose/typegoose';

export class Track {
  @prop({ default: Date.now })
  public created?: Date;

  @prop()
  public id?: String;

  @prop()
  public name?: String;

  @prop()
  public artist?: String;

  @prop()
  public open_url?: String;

  @prop()
  public uri?: String;

  @prop()
  public added_at?: Date;
}

export class Playlist {
  @prop()
  public title?: String;

  @prop({ default: Date.now })
  public published_date?: Date;

  @prop({ type: Track })
  public tracks?: Track[];
}