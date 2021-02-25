import mongoose from 'mongoose';
 
import Customer from './customer';
import Content from './content';
import Collaborative from './collaborative';
 
const connectDb = () => mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
 
const models = { Customer, Content, Collaborative };
 
export { connectDb };
 
export default models;