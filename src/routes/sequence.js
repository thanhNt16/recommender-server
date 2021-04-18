import { Router } from 'express';
import auth from '../middleware';
const router = Router();

router.get('/', auth, async (req, res) => {
  const sequence = await req.context.models.Sequence.find();
  return res.send(sequence);
});

router.post('/create', auth, async (req, res) => {
  try {
    const { userId, feedBack, itemId, date, customerId } = req.body;
    const sequenceRecord = await req.context.models.Sequence.create({
      itemId,
      userId,
      feedBack,
      date,
      customer: customerId,
    });
    await sequenceRecord.save();

    if (!sequenceRecord) {
      return res.status(400).send('Error in creating sequence');
    }
    return res.send(sequenceRecord);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.get('/:sequenceid', auth, async (req, res) => {
  try {
    const sequence = await req.context.models.Sequence.findById(
      req.params.sequenceid,
    );
    if (!sequence)
      return res
        .status(400)
        .send(
          `sequence with this id ${req.params.sequenceid} does not exist`,
        );
    return res.send(sequence);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});
router.put('/:sequenceid', auth, async (req, res) => {
  try {
    const sequence = await req.context.models.Sequence.findOneAndUpdate(
      { _id: req.params.sequenceid },
      { ...req.body },
      { new: true, useFindAndModify: false },
    );
    return res.status(200).send(sequence);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.delete('/:sequenceid', auth, async (req, res) => {
  try {
    const sequence = await req.context.models.Sequence.findById(
      req.params.sequenceid,
    );
    if (!sequence) {
      return res
        .status(400)
        .send(
          `sequence with id ${req.params.sequenceid} does not exist`,
        );
    }
    await sequence.remove();
    return res
      .status(200)
      .send(
        `Delete sequence with id ${req.params.sequenceid} success`,
      );
  } catch (error) {
    return res
      .status(400)
      .send(
        `Error in deleting sequence with id ${req.params.sequenceid}`,
      );
  }
});
export default router;
