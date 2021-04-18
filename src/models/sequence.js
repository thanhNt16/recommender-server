import mongoose, { Schema } from 'mongoose';

const sequenceSchema = new mongoose.Schema(
  {
    userId: {
        type: String,
        required: true,
    },
    itemId: {
      type: String,
      required: true,
    },
    feedBack: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
    },
  },
  { timestamps: true },
);
const Sequence = mongoose.model('Sequence', sequenceSchema);

export default Sequence;
