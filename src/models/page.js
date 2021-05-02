import mongoose, { Schema } from 'mongoose';

const pageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    algorithm: {
      type: String,
      required: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
    },
  },
);
const Page = mongoose.model('page', pageSchema);
 
export default Page;