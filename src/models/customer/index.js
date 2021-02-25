import mongoose from 'mongoose';
import bcrypt from 'bcrypt'

const customerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    accessToken: {
      type: String
    },
    apiKey: {
      type: String
    },
    role: {
      type: String,
      default: "User"
    }
  },
  { timestamps: true },
);
const Customer = mongoose.model('Customer', customerSchema);
 
export default Customer;