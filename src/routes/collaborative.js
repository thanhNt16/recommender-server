import { Router } from 'express';
import auth from '../middleware';
const router = Router();

router.get('/', auth, async (req, res) => {
  const collaborative = await req.context.models.Collaborative.find();
  return res.send(collaborative);
});

router.post('/create', auth, async (req, res) => {
  try {
    const { userId, feedBack, explicit, itemId, content, customerId } = req.body;
    const collaborativeRecord = await req.context.models.Collaborative.create({
      itemId,
      content,
      userId,
      feedBack,
      explicit,
      customer: customerId,
    });
    await collaborativeRecord.save();

    if (!collaborativeRecord) {
      return res.status(400).send('Error in creating collaborative');
    }
    return res.send(collaborativeRecord);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.get('/:collaborativeId', auth, async (req, res) => {
  try {
    const collaborative = await req.context.models.Collaborative.findById(
      req.params.collaborativeId,
    );
    if (!collaborative)
      return res
        .status(400)
        .send(
          `Collaborative with this id ${req.params.collaborativeId} does not exist`,
        );
    return res.send(collaborative);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});
router.put('/:collaborativeId', auth, async (req, res) => {
  try {
    const collaborative = await req.context.models.Collaborative.findOneAndUpdate(
      { _id: req.params.collaborativeId },
      { ...req.body },
      { new: true, useFindAndModify: false },
    );
    return res.status(200).send(collaborative);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.delete('/:collaborativeId', auth, async (req, res) => {
  try {
    const collaborative = await req.context.models.Collaborative.findById(
      req.params.collaborativeId,
    );
    if (!collaborative) {
      return res
        .status(400)
        .send(
          `collaborative with id ${req.params.collaborativeId} does not exist`,
        );
    }
    await collaborative.remove();
    return res
      .status(200)
      .send(
        `Delete collaborative with id ${req.params.collaborativeId} success`,
      );
  } catch (error) {
    return res
      .status(400)
      .send(
        `Error in deleting collaborative with id ${req.params.collaborativeId}`,
      );
  }
});
export default router;
