import mongoose from 'mongoose';

import Customer from './customer';
import Content from './content';
import Collaborative from './collaborative';
import Sequence from './sequence';
import Page from './page';
import Scenario from './scenario';
const connectDb = () => {
  return mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
};

const models = { Customer, Content, Collaborative, Sequence, Scenario, Page };

export { connectDb };

export default models;
