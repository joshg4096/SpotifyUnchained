import { SpotifyController } from '../controllers/spotify';
import * as mongoose from 'mongoose';
import { getModelForClass } from '@typegoose/typegoose';
import { Playlist } from '../models/playlist';
import { fail } from 'assert';
import { describe } from 'mocha';
import assert from 'assert';

describe('SpotifyController', () => {
  describe('sync', () => {
    it('should run successfully', async () => {
      await mongoose
        .connect('mongodb://localhost:27017/spotifyunchained-mocha', { useNewUrlParser: true, useUnifiedTopology: true, dbName: 'test' });
      const spotifyController = SpotifyController.getInstance();
      await spotifyController.sync();

      const playListModel = getModelForClass(Playlist);

      await playListModel.find().then((results) => {
        assert.strictEqual(results.length, 1);
        results.every((playlist) => {
          // console.log(playlist.tracks);
          if (playlist.tracks) {
            assert.ok(playlist.tracks.length > 1);
          } else {
            fail('No tracks exist');
          }
        });
      });

      await mongoose.connection.dropDatabase();
      return mongoose.disconnect();
    });
  });
});
