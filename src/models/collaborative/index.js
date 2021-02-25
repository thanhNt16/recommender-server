import mongoose, { Schema } from 'mongoose';

const collaborativeSchema = new mongoose.Schema(
  {
    itemId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    feedBack: {
      type: Number,
      required: true,
    },
    explicit: {
      type: Boolean,
      required: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
    },
  },
  { timestamps: true },
);
const Collaborative = mongoose.model('Collaborative', collaborativeSchema);

export default Collaborative;
