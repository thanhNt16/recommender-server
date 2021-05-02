import mongoose, { Schema } from 'mongoose';

const scenarioSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    page: [{ type: Schema.Types.ObjectId, ref: 'page', require: false}],
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
    },
  },
  { timestamps: true },
);
const Scenario = mongoose.model('Scenario', scenarioSchema);
 
export default Scenario;