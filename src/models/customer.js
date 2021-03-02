import mongoose from 'mongoose';
import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const customerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: value => {
            if (!validator.isEmail(value)) {
                throw new Error({error: 'Invalid Email address'})
            }
        }
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

customerSchema.pre('save', async function (next) {
  // Hash the password before saving the user model
  const user = this
  if (user.isModified('password')) {
      user.password = await bcrypt.hash(user.password, 8)
  }
  next()
})
customerSchema.methods.generateAuthToken = async function() {
  // Generate an auth token for the user
  const user = this
  const { role, email, fullName } = user
  const token = jwt.sign({role, email, fullName}, process.env.JWT_KEY)
  user.accessToken = token
  await user.save()
  return token
}

customerSchema.statics.findByLogin = async function(login) {
  let user = await this.findOne({
    email: login,
  });

  if (!user) {
    throw new Error("Customer with this credential does not exist !")
  }

  return user;
};
const Customer = mongoose.model('Customer', customerSchema);
export default Customer;

// userSchema.pre('remove', function(next) {
//   this.model('Message').deleteMany({ user: this._id }, next);
// });

