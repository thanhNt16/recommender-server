import 'dotenv/config';
import cors from 'cors';
import bodyParser from 'body-parser'
import express from 'express';

import models, { connectDb } from './models';
import routes from './routes';

const app = express();

// * Application-Level Middleware * //

// Third-Party Middleware

app.use(cors());
app.use(bodyParser.json({ type: 'application/*+json' }))

// Built-In Middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom Middleware

app.use(async (req, res, next) => {
  req.context = {
    models,
    // me: await models.User.findByLogin('rwieruch'),
  };
  next();
});

// * Routes * //

// app.use('/session', routes.session);
app.use('/customers', routes.customer);
app.use('/contents', routes.content);
app.use('/collaboratives', routes.collaborative);
app.use('/auth', routes.auth);
// app.use('/messages', routes.message);

// * Start * //

const eraseDatabaseOnSync = true;

connectDb().then(async () => {
  if (eraseDatabaseOnSync) {
    // await Promise.all([
    //   models.User.deleteMany({}),
    //   models.Message.deleteMany({}),
    // ]);

    // createUsersWithMessages();
  }

  app.listen(process.env.PORT, () =>
    console.log(`Recommender server listening on port ${process.env.PORT}!`),
  );
});

// * Database Seeding * //

