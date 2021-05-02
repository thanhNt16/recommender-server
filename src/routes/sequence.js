import { Router } from 'express';
import _ from 'lodash'
import moment from 'moment'
import auth from '../middleware';
const router = Router();


function generateDataset(sequence) {
  const grouped = _.groupBy(sequence, 'itemId')
  const categories = _.uniq(Object.keys(grouped))
  const dataset = []
  
  for (let index = 0; index < categories.length; index++) {
    let count = 0;
    for (let j = 0; j < grouped[categories[index]].length; j++) {
      count += 1;
    }
    dataset.push({ category: categories[index], value: count })
  }
  console.log("gr", _.orderBy(dataset, [function(o) { return o.value }]), Object.keys(dataset).length)
  return _.orderBy(dataset, [function(o) { return o.value }], ['desc'])

}

router.get('/', auth, async (req, res) => {
  const sequence = await req.context.models.Sequence.find({ customer: req.customer._id, date: {
    $gte: moment().subtract(1, 'months').format(), 
    $lt: moment().format()
  }}).lean()
  console.log('seq', sequence)

  const dataset =  generateDataset(sequence).slice(0, 20)
  return res.send(dataset);
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
