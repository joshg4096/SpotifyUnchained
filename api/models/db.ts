import mongoose from 'mongoose';
import chalk from 'chalk';
import {DB_URI} from '../config/constants';
import {SpotifyController} from '../controllers/spotify';
import schedule from 'node-schedule';

mongoose.connect(DB_URI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    },
    (err) => {
      if (err) {
        console.error(chalk.red('Could not connect to MongoDB!'));
        console.log(chalk.red(err));
      }
    });

mongoose.connection.on('connected', () => {
  console.log(`Mongoose connected to database`);
  // Kick off the first sync when the server starts up
  const spotifyController = SpotifyController.getInstance();
  spotifyController.sync();

  // Schedule cron to sync every 2 hours
  const rule = new schedule.RecurrenceRule();
  rule.hour = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
  rule.minute = 0;

  const j = schedule.scheduleJob(rule, () => {
    spotifyController.sync();
  });
});
mongoose.connection.on('error', (err) => {
  console.log(`Mongoose connection error: ${err}`);
});
mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});
