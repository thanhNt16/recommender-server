import jwt from 'jsonwebtoken';
import express from 'express';
import {
  ApolloServer,
  AuthenticationError
} from 'apollo-server-express';
import cors from 'cors';
import 'dotenv/config';
import models, { connectDb } from './models';

import { resolvers, typeDefs } from './setup/schema';

const getMe = async (req) => {
  const token = req.headers.authentication ? req.headers.authentication.split(" ")[1] : null;
  console.log('token', token);

  if (token) {
    try {
      return await jwt.verify(token , process.env.SECRET);
    } catch (e) {
      console.log("Error Your session expired. Sign in again")
      // throw new AuthenticationError('Your session expired. Sign in again');
      return null;
    }
  }
  return null;
}

const app = express();
// const PORT = process.env.PORT;
app.use(cors());
const createUsersWithMessages = async () => {
  const user1 = new models.Customer({
    fullName: 'harry',
    email: "test@test.com",
    password: "123",
    accessToken: "abc123",
    apiKey: "123abc"
  });
 
  await user1.save();
};


const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: error => 
    // const message = error.message
    //   .replace('SequelizeValidationError: ', '')
    //   .replace('Validation error: ', '');
    // return {
    //   ...error,
    //   message,
    // };
     error
  ,
  context: async ({ req }) => {
    const me = await getMe(req);
    
    return {
      me,
      models,
      secret: process.env.SECRET
    }
  }
});

server.applyMiddleware({
  app,
  path: '/graphql'
});
connectDb().then(async () => {
  // createUsersWithMessages()
  app.listen(process.env.PORT, () =>
    console.log(`Apollo Server on http://localhost:${process.env.PORT}/graphql`),
  );
});
// app.listen({
//   port: 8000
// }, () => {
//   console.log('');
// });