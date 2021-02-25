import mongoose, { Schema } from 'mongoose';

const contentSchema = new mongoose.Schema(
  {
    itemId: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
    },
  },
  { timestamps: true },
);
const Content = mongoose.model('Content', contentSchema);
 
export default Content;