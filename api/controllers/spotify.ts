'use strict';

/**
 * Module dependencies.
 */
import fetch from 'node-fetch';
import { URLSearchParams } from 'url';
import { PlayListController } from './playlist';
import _ from 'lodash';
import { Track } from '../models/playlist';
import { CLIENT_ID, CLIENT_SECRET, PLAYLIST_ID } from '../config/constants';

const params = new URLSearchParams();
params.append('grant_type', 'client_credentials');


const authOptions = {
  method: 'POST',
  body: params,
  headers: {
    Authorization: 'Basic ' +
      (Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')),
  },
};

export class SpotifyController {

  private constructor() {

  }

  private static instance: SpotifyController;
  private playListController = PlayListController.getInstance();

  public static getInstance(): SpotifyController {
    return this.instance || (this.instance = new this());
  }

  private saveTracks(data): Promise<void> {
    const tracks: Track[] = [];

    try {
      data.items.forEach(function (item) {
        if (!_.isNull(item.track)) {
          tracks.push({
            id: item.track.id,
            name: item.track.name,
            artist: item.track.artists[0].name,
            added_at: item.added_at,
            open_url: item.track.external_urls.spotify,
            uri: item.track.uri,
          });
        }
      });
    } catch (err) {
      console.error('Unable to read track json', err);
      return;
    }

    return this.playListController.create(tracks);
  }

  private async downloadAdditionalTracks(body, options): Promise<void> {
    let nextUrl = body.next;
    while (nextUrl) {
      console.log('Downloading additional page', nextUrl);
      const nextPageRes = await fetch(nextUrl, options);
      const nextPage = await nextPageRes.json();
      nextUrl = nextPage.next;
      body.items = body.items.concat(nextPage.items);
    }
  }
  /**
   * Sync a Spotify playlist by fetching the results and saving them to the
   * database
   */
  public async sync(): Promise<void> {
    return fetch('https://accounts.spotify.com/api/token', authOptions)
      .then(async (res) => {
        const body = await res.json();
        const token = body.access_token;
        console.log('TOKEN: ' + token);

        const url = 'https://api.spotify.com/v1/users/spotify/playlists/' + PLAYLIST_ID + '/tracks';

        const options = {
          headers: {
            Authorization: 'Bearer ' + token,
          },
        };

        const playlistRes = await fetch(url, options);
        if (!playlistRes.ok) {
          throw (playlistRes.statusText);
        }
        const playlistBody = await playlistRes.json();
        if (playlistBody.next) {
          await this.downloadAdditionalTracks(playlistBody, options);
        }
        this.saveTracks(playlistBody);
      })
      .catch((err) => {
        console.error('Error downloading playlists:', err);
      });
  }
}
