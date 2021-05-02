import { Router } from 'express';
import auth from '../middleware';
import Scenario from '../models/scenario'
const router = Router();

router.get('/', auth, async (req, res) => {
  const scenarios = await Scenario.find({ customer: req.customer._id }).populate('page').lean();
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

router.get('/:pageId', auth, async (req, res) => {
  try {
    const page = await req.context.models.Page.findById(req.params.pageId);
    if (!content)
      return res
        .status(400)
        .send(`Page with this id ${req.params.pageId} does not exist`);
    return res.send(page);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});
router.put('/:pageId', auth, async (req, res) => {
  try {
    const page = await req.context.models.Page.findOneAndUpdate(
      { _id: req.params.pageId },
      { ...req.body },
      { new: true, useFindAndModify: false },
    );
    return res.status(200).send(page);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.delete('/:pageId', auth, async (req, res) => {
  try {
    const page = await req.context.models.Page.findById(req.params.pageId);
    if (!page) {
      return res
        .status(400)
        .send(`page with id ${req.params.pageId} does not exist`);
    }
    await page.remove();
    return res
      .status(200)
      .send(`Delete page with id ${req.params.pageId} success`);
  } catch (error) {
    return res
      .status(400)
      .send(`Error in deleting page with id ${req.params.pageId}`);
  }
});
export default router;
