import { Router } from 'express';
import auth from '../middleware';
const router = Router();

router.get('/', auth, async (req, res) => {
  const contents = await req.context.models.Content.find();
  return res.send(contents);
});

router.post('/create', auth, async (req, res) => {
  try {
    const { itemId, content, customerId } = req.body;
    const contentRecord = await req.context.models.Content.create({
      itemId,
      content,
      customer: customerId,
    });
    await contentRecord.save();

    if (!contentRecord) {
      return res.status(400).send('Error in creating content');
    }
    return res.send(contentRecord);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.get('/:contentId', auth, async (req, res) => {
  try {
    const content = await req.context.models.Content.findById(
      req.params.contentId,
    );
    if (!content)
      return res
        .status(400)
        .send(
          `Content with this id ${req.params.contentId} does not exist`,
        );
    return res.send(content);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});
router.put('/:contentId', auth, async (req, res) => {
  try {
    const content = await req.context.models.Content.findOneAndUpdate(
      { _id: req.params.contentId },
      { ...req.body },
      { new: true, useFindAndModify: false },
    );
    return res.status(200).send(content);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.delete('/:contentId', auth, async (req, res) => {
  try {
    const customer = await req.context.models.Content.findById(
      req.params.contentId,
    );
    if (!customer) {
      return res
        .status(400)
        .send(
          `Customer with id ${req.params.contentId} does not exist`,
        );
    }
    await customer.remove();
    return res
      .status(200)
      .send(
        `Delete customer with id ${req.params.contentId} success`,
      );
  } catch (error) {
    return res
      .status(400)
      .send(
        `Error in deleting customer with id ${req.params.contentId}`,
      );
  }
});
export default router;
