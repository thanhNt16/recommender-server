import { Router } from 'express';
import auth from '../middleware';
import Scenario from '../models/scenario'
const router = Router();

router.get('/', auth, async (req, res) => {
  const scenarios = await Scenario.find({ customer: req.customer._id, sample: { "$ne": true } }).populate('page').lean();
  return res.send(scenarios);
});

router.get('/sample', auth, async (req, res) => {
  const scenarios = await Scenario.find({ sample: true }).populate('page').lean();
  return res.send(scenarios);
});

router.post('/create', auth, async (req, res) => {
  try {
    const { name, customerid, page } = req.body;
    const sceRecord = new Scenario();
    sceRecord.name = name
    sceRecord.customer = customerid
    sceRecord.page = page.split(',')
    await sceRecord.save();

    if (!sceRecord) {
      return res.status(400).send('Error in creating scenario');
    }
    return res.send(sceRecord);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.get('/:scenarioId', auth, async (req, res) => {
  try {
    const scenario = await req.context.models.Scenario.findById(req.params.scenarioId);
    if (!scenario)
      return res
        .status(400)
        .send(`Scenario with this id ${req.params.scenarioId} does not exist`);
    return res.send(scenario);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});
router.put('/:scenarioId', auth, async (req, res) => {
  try {
    const scenario = await req.context.models.Scenario.findOneAndUpdate(
      { _id: req.params.scenarioId },
      { ...req.body },
      { new: true, useFindAndModify: false },
    );
    return res.status(200).send(scenario);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.delete('/:scenarioId', auth, async (req, res) => {
  try {
    const scenario = await req.context.models.Scenario.findById(req.params.scenarioId);
    if (!scenario) {
      return res
        .status(400)
        .send(`scenario with id ${req.params.scenarioId} does not exist`);
    }
    await scenario.remove();
    return res
      .status(200)
      .send(`Delete scenario with id ${req.params.pageId} success`);
  } catch (error) {
    return res
      .status(400)
      .send(`Error in deleting scenario with id ${req.params.pageId}`);
  }
});
export default router;
