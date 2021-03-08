import { Router } from 'express';
import auth from '../middleware';
import Content from '../models/content';
const router = Router();
import multer from 'multer';
import fs from 'fs';
import { parse } from '@fast-csv/parse';
import { listener } from '../services/rabbitService'

// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    cb(
      null,
      req.customer._id +
        '-' +
        Date.now() +
        '.' +
        file.originalname.split('.')[1],
    );
  },
});

var upload = multer({ storage: storage });
router.post('/content', auth, upload.single('content'), (req, res, next) => {
  const file = req.file;
  const customer = req.customer;
  const Content = req.context.models.Content;
  if (!file) {
    const error = new Error('Please upload a file');
    error.httpStatusCode = 400;
    return next(error);
  }
  fs.createReadStream(file.path)
    .pipe(parse())
    .on('error', (error) => console.error(error))
    .on('data', async (row) => {
      const content = await Content.findOne({
        itemId: row[0],
        content: row[1],
        customer: customer._id,
      });
      if (content) {
        console.log('Content already existed. Skip');
      } else {
        Content.create({
          itemId: row[0],
          content: row[1],
          customer: customer._id,
        }).then((data) => console.log(`Inserted ${data}`));
      }
    })
    .on('end', (rowCount) => {
      listener.emit("sendMessage", "Start training")
    });
  res.send(file);
});
router.post(
  '/collaborative/:isExplicit',
  auth,
  upload.single('collaborative'),
  (req, res, next) => {
    const file = req.file;
    const customer = req.customer;
    const isExplicit = req.params.isExplicit;
    const Collaborative = req.context.models.Collaborative;
    if (!file) {
      const error = new Error('Please upload a file');
      error.httpStatusCode = 400;
      return next(error);
    }
    fs.createReadStream(file.path)
      .pipe(parse({ ignoreEmpty: true }))
      .on('error', (error) => console.error(error))
      .on('data', async (row) => {
        const collaborative = await Collaborative.findOne({
          userId: row[0],
          itemId: row[1],
          feedBack: parseFloat(row[2]),
          explicit: isExplicit,
          customer: customer._id,
        });
        if (collaborative) {
          console.log('Collaborative already existed. Skip');
        } else {
          Collaborative.create({
            userId: row[0],
            itemId: row[1],
            feedBack: parseFloat(row[2]),
            explicit: isExplicit,
            customer: customer._id,
          }).then((data) => console.log(`Inserted ${data}`));
        }
      })
      .on('end', (rowCount) => console.log(`Parsed ${rowCount} rows`));
    res.send(file);
  },
);

export default router;
