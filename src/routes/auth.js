import { Router } from 'express';
import bcrypt from 'bcrypt'
import auth from '../middleware'
const router = Router();

router.get('/me', auth, async(req, res) => {
    // View logged in user profile
    res.send(req.customer)
})
router.post('/signOut', auth, async(req, res) => {
  // View logged in user profile
  const incomingToken = req.header('Authorization').replace('Bearer ', '')
  const token = req.customer.token
  try {
    const customer = await req.context.models.Customer.findById(req.customer._id)
    if (incomingToken === token) {
      req.customer = null
      customer.token = null
    }
    res.status(200).send({ message: 'Sign out succesfully'})
  } catch (error) {
    res.status(500).send({ error: error.message })
  }
  
})

router.post('/signUp', async (req, res) => {
  try {
    const customer = await req.context.models.Customer.create(
      req.body,
    );
    await customer.save();
    const token = await customer.generateAuthToken();
    res.status(200).json({ customer, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post('/signIn', async (req, res) => {
    const { email, password } = req.body
  const customer = await req.context.models.Customer.findOne({
    email,
  });
  if (!customer) {
      res.status(404).send("Customer with this email does not exist")
  }
  const isPasswordMatch = await bcrypt.compare(password, customer.password)
  if (!isPasswordMatch) {
      res.status(401).send("Password does not match")
  }
  const token = await customer.generateAuthToken() 

  return res.status(200).send({ token, customer });
});

export default router;
