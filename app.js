const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');

const config = require('./utils/config');
const blogRouter = require('./controllers/blogs');
const { info, error } = require('./utils/logger');
const middleware = require('./utils/middleware');

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    info('Connected to MongoDB');
  })
  .catch((err) => {
    error('Error connecting to MongoDB:', err.message);
  });

app.use(cors());
app.use(express.json());
app.use('/api/blogs', blogRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
