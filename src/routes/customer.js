import { Router } from 'express';
import auth from '../middleware'
const router = Router();

router.get('/', auth, async (req, res) => {
  const users = await req.context.models.Customer.find();
  return res.send(users);
});

router.get('/:customerId', auth, async (req, res) => {
  try {
    const user = await req.context.models.Customer.findById(
      req.params.customerId,
    );
    if (!user)
      return res.status(400).send(`Customer with this id ${req.params.customerId} does not exist`)
    return res.send(user);   
  } catch (error) {
    return res.status(400).send(error.message)
  }
 
});
router.put('/:customerId', auth, async (req, res) => {
  try {
    const customer = await req.context.models.Customer.findOneAndUpdate(
      { _id: req.params.customerId }, {...req.body}, { new: true, useFindAndModify: false }
    );
    return res.status(200).send(customer)
  } catch (error) {
    return res.status(400).send(error.message)
  }
});

router.delete('/:customerId', auth, async (req, res) => {
  try {
    const customer = await req.context.models.Customer.findById(
      req.params.customerId,
    );
    if (!customer) {
      return res.status(400).send(`Customer with id ${req.params.customerId} does not exist`)
    }
    await customer.remove()
    return res.status(200).send(`Delete customer with id ${req.params.customerId} success`)
  } catch (error) {
    return res.status(400).send(`Error in deleting customer with id ${req.params.customerId}`)
  }
});
export default router;
