const express = require('express');
const morgan = require('morgan');

const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(require('./routes/UserRoute'));
app.use(require('./routes/EventsRoute'));

module.exports = app;