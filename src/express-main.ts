// @ts-ignore
import cookieParser = require("cookie-parser");
import bodyParser = require('body-parser');
import express = require("express");
import session = require('express-session');
import helmet = require('helmet');
import createError = require("http-errors");
import logger = require("morgan");
import path = require("path");

import indexRouter = require("./code/routes/index");
import loginRouter = require("./code/routes/login");
import registerRouter = require("./code/routes/register");
const timeout = require('connect-timeout');


const app = express();
app.use(timeout(1000 * 60 * 10)); // 10 mins


// HBS helpers
import exphbs = require('express-handlebars');
import layouts = require('handlebars-layouts')
import handlebars = require('handlebars')

const hbsHelpers = exphbs.create({
  extname: 'hbs',
  defaultLayout: 'layout',
  helpers: layouts(handlebars),
});
handlebars.registerHelper('json', function (content) {
  return JSON.stringify(content);
});
handlebars.registerHelper('xIf', function (lvalue, operator, rvalue, options) {

  var operators, result;

  if (arguments.length < 3) {
    throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
  }

  if (options === undefined) {
    options = rvalue;
    rvalue = operator;
    operator = "===";
  }

  operators = {
    '==': function (l, r) { return l == r; },
    '===': function (l, r) { return l === r; },
    '!=': function (l, r) { return l != r; },
    '!==': function (l, r) { return l !== r; },
    '<': function (l, r) { return l < r; },
    '>': function (l, r) { return l > r; },
    '<=': function (l, r) { return l <= r; },
    '>=': function (l, r) { return l >= r; },
    'typeof': function (l, r) { return typeof l == r; }
  };

  if (!operators[operator]) {
    throw new Error("'xIf' doesn't know the operator " + operator);
  }

  result = operators[operator](lvalue, rvalue);

  if (result) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

app.engine('hbs', hbsHelpers.engine);


// view engine setup
app.set("views", path.join(__dirname, "../src/views"));
app.set("view engine", "hbs");


// Register partials
import fs = require('fs');
var partialsDir = path.join(__dirname, "../src/views/partials");
var filenames = fs.readdirSync(partialsDir);

filenames.forEach(function (filename) {
  var matches = /^([^.]+).hbs$/.exec(filename);
  if (!matches) {
    return;
  }
  var name = matches[1];
  var template = fs.readFileSync(partialsDir + '/' + filename, 'utf8');
  handlebars.registerPartial(name, template);
});


app.use(logger("dev"));
app.use(cookieParser());
app.use(haltOnTimedout);
app.use(express.static(path.join(__dirname, "../src/public")));



// Session
//var MemoryStore = require('memorystore')(session)
var MemoryStore = require('session-memory-store')(session);

const expiryDate = new Date(Date.now() + 180 * 60 * 1000); // 3 hour

app.use(session({
  secret: 's3Cur3',
  name: "sessionId",
  store: new MemoryStore({
    expires: 60 * 60 * 12,
    checkperiod: 10 * 60
  }),
  saveUninitialized: true,
  resave: true,
  cookie: {
    secure: app.get("env") !== "development",
    httpOnly: true
  }
}));

// Helmet
app.use(helmet());

// App Middlewares
import appMiddleWares from './code/app/appMiddlewares';
app.use(appMiddleWares.do);

// BodyParser
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb', parameterLimit: 50000 }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.raw({
  limit: '50mb',
  inflate: true
}));
app.use(bodyParser());
app.use(haltOnTimedout);

// Routes
app.use("/", indexRouter.default);
app.use("/login", loginRouter.default);
app.use("/register", registerRouter.default);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404, "This page does not exist"));
});

// error handler
app.use(function (err: any, req: any, res: any, next: any) {

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);// http status
  res.render("error");

});

app.set("port", process.env.PORT || 3000);

function haltOnTimedout(req, res, next) {
  if (!req.timedout) { 
    next(); 
  } else {
    process.exit();
  }
}

const server = app.listen(app.get("port"), function () {
  // debug('Express server listening on port ' + server.address().port);
});

process.on("uncaughtException", function (e) {
  process.exit();
});

process.on("SIGTERM", function (e) {
  process.exit();
});

process.on('unhandledRejection', error => {
  process.exit();
});


