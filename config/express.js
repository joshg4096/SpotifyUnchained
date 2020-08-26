'use strict';

/**
 * Module dependencies.
 */
var fs = require('fs'),
  https = require('https'),
  express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  session = require('express-session'),
  compress = require('compression'),
  methodOverride = require('method-override'),
  cookieParser = require('cookie-parser'),
  helmet = require('helmet'),
  MongoStore = require('connect-mongo')({
    session: session
  }),
  flash = require('connect-flash'),
  config = require('./config'),
  path = require('path');

module.exports = function(mongoose) {
  // Initialize express app
  var app = express();

  // Globbing model files
  config.getGlobbedFiles('./app/models/**/*.js').forEach(function(modelPath) {
    require(path.resolve(modelPath));
  });

  // Setting application local variables
  app.locals.title = config.app.title;
  app.locals.description = config.app.description;
  app.locals.keywords = config.app.keywords;
  app.locals.jsFiles = config.getJavaScriptAssets();
  app.locals.cssFiles = config.getCSSAssets();

  // Passing the request url to environment locals
  app.use(function(req, res, next) {
    res.locals.url = req.protocol + '://' + req.headers.host + req.url;
    next();
  });

  // Should be placed before express.static
  app.use(compress({
    filter: function(req, res) {
      return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
    },
    level: 9
  }));

  // Showing stack errors
  app.set('showStackError', true);

  // Environment dependent middleware
  if (process.env.NODE_ENV === 'development') {
    // Enable logger (morgan)
    app.use(morgan('dev'));
  } else if (process.env.NODE_ENV === 'production') {
    app.locals.cache = 'memory';
  }

  // Request body parsing middleware should be above methodOverride
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());
  app.use(methodOverride());

  // CookieParser should be above session
  app.use(cookieParser());

  // Express MongoDB session storage
  app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: config.sessionSecret,
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      collection: config.sessionCollection
    })
  }));

  // connect flash for flash messages
  app.use(flash());

  // Use helmet to secure Express headers
  app.use(helmet.frameguard());
  app.use(helmet.xssFilter());
  app.use(helmet.noSniff());
  app.use(helmet.ieNoOpen());
  app.disable('x-powered-by');

  // Setting the app router and static folder
  app.use(express.static(path.resolve('./dist/SpotifyUnchained')));

  // Globbing routing files
  config.getGlobbedFiles('./app/routes/**/*.js').forEach(function(routePath) {
    require(path.resolve(routePath))(app);
  });

  // Assume 'not found' in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
  app.use(function(err, req, res, next) {
    // If the error object doesn't exists
    if (!err) return next();

    // Log it
    console.error(err.stack);

    // Error page
    res.status(500).send({
      error: 'Internal error'
    });
  });

  // Assume 404 since no middleware responded
  app.use(function (req, res) {
    res.status(404).send({
      url: req.originalUrl,
      error: 'Not Found'
    });
  });

  if (process.env.NODE_ENV === 'secure') {
    // Log SSL usage
    console.log('Securely using https protocol');

    // Load SSL key and certificate
    var privateKey = fs.readFileSync('./config/sslcerts/key.pem', 'utf8');
    var certificate = fs.readFileSync('./config/sslcerts/cert.pem', 'utf8');

    // Create HTTPS Server
    var httpsServer = https.createServer({
      key: privateKey,
      cert: certificate
    }, app);

    // Return HTTPS server instance
    return httpsServer;
  }

  // Return Express server instance
  return app;
};