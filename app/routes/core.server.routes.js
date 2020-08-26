'use strict';

module.exports = function (app) {
  // Root routing
  const core = require('../../app/controllers/core.server.controller');
  app.route('/').get(core.index);

  // Kick off the first sync when the server starts up
  const spotify = require('../../app/controllers/spotify.server.controller');
  spotify.sync();

  // Schedule cron to sync every 2 hours
  const schedule = require('node-schedule');

  const rule = new schedule.RecurrenceRule();
  rule.hour = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
  rule.minute = 0;

  const j = schedule.scheduleJob(rule, function () {
    spotify.sync();
  });
};
