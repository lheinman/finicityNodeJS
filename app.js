var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var borrowersRouter = require('./routes/borrowers');
var databaseRouter = require('./routes/database');
var schemaRouter = require('./routes/schema');
var authenticateRouter = require('./routes/authenticate');
var customersRouter = require('./routes/customers');
var consumersRouter = require('./routes/consumers');
var connectionRouter = require('./routes/connection');
var reportsRouter = require('./routes/reports');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/borrowers', borrowersRouter);
app.use('/database', databaseRouter);
app.use('/schema', schemaRouter);
app.use('/authenticate', authenticateRouter);
app.use('/customers', customersRouter);
app.use('/consumers', consumersRouter);
app.use('/connection', connectionRouter);
app.use('/reports', reportsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;