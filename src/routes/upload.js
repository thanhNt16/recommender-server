import { Router } from 'express';
import auth from '../middleware';
import Content from '../models/content';
const router = Router();
import multer from 'multer';
import fs from 'fs';
import PromiseBar from 'promise.bar';
import { parse } from '@fast-csv/parse';
import { listener } from '../services/rabbitService';
PromiseBar.enable();

// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    cb(
      null,
      req.customer._id + '-content' + '.' + file.originalname.split('.')[1],
    );
  },
});

var upload = multer({ storage: storage });
router.post(
  '/content',
  auth,
  upload.single('content'),
  async (req, res, next) => {
    const file = req.file;
    const customer = req.customer;
    const Content = req.context.models.Content;
    const dataFromFile = [];
    if (!file) {
      const error = new Error('Please upload a file');
      error.httpStatusCode = 400;
      return next(error);
    }
    fs.createReadStream(file.path)
      .pipe(parse())
      .on('error', (error) => console.error(error))
      .on('data', async (row) => {
        dataFromFile.push({
          itemId: row[0],
          content: row[1],
          customer: customer._id,
        });
      })
      .on('end', async (rowCount) => {
        console.log('Read file complete', rowCount);
        const insertData = dataFromFile.map(async (row) => {
          try {
            const content = await Content.findOne({
              itemId: row.itemId,
              content: row.content,
              customer: row.customer,
            });
            if (content) {
              console.log('Content already existed. Skip');
              return;
            } else {
              const result = await Content.create({
                itemId: row.itemId,
                content: row.content,
                customer: row.customer,
              });
              return result;
            }
          } catch (error) {
            res.status(400).json({
              message:
                'Invalid upload file format. Please check the instruction again',
            });
          }
        });
        await PromiseBar.all(insertData, { label: 'Minify' })
          .then(() =>
            listener.emit(
              'sendMessage',
              JSON.stringify({
                user_id: customer._id,
                command: 'train',
                algorithm: 'content',
                params: '',
              }),
            ),
          )
          .catch((err) => res.status(400).json({ message: err.message }));
      });
    res.status(200).json({
      message: 'Upload data success -> Start training process',
    });
  },
);
router.post(
  '/collaborative/:isExplicit',
  auth,
  upload.single('collaborative'),
  (req, res, next) => {
    const file = req.file;
    const customer = req.customer;
    const isExplicit = req.params.isExplicit;
    const Collaborative = req.context.models.Collaborative;
    const dataFromFile = [];

    if (!file) {
      const error = new Error('Please upload a file');
      error.httpStatusCode = 400;
      return next(error);
    }
    fs.createReadStream(file.path)
      .pipe(parse({ ignoreEmpty: true }))
      .on('error', (error) => console.error(error))
      .on('data', async (row) => {
        console.log(row);
        dataFromFile.push({
          userId: row[0],
          itemId: row[1],
          feedBack: parseFloat(row[2]),
          explicit: isExplicit,
          customer: customer._id,
        });
      })
      .on('end', async (rowCount) => {
        console.log('Read file complete', rowCount);
        try {
          const insertData = dataFromFile.map(async (row) => {
            console.log(row);
            const collaborative = await Collaborative.findOne({
              userId: row.userId,
              itemId: row.itemId,
              feedBack: row.feedBack,
              explicit: row.explicit,
              customer: row.customer,
            });
            if (collaborative) {
              console.log('Collaborative already existed. Skip');
              return;
            } else {
              const result = await Collaborative.create({
                userId: row.userId,
                itemId: row.itemId,
                feedBack: row.feedBack,
                explicit: row.explicit,
                customer: row.customer,
              });
              return result;
            }
          });
          await PromiseBar.all(insertData, { label: 'Minify' })
            .then(() =>
              listener.emit(
                'sendMessage',
                JSON.stringify({
                  user_id: customer._id,
                  command: 'train',
                  algorithm: 'collaborative',
                  params: isExplicit === 'true' ? 'explicit' : 'implicit',
                }),
              ),
            )
            .catch((err) =>
              res.status(400).json({
                message: err.message,
              }),
            );
        } catch (error) {
          res.status(400).json({
            message:
              'Invalid upload file format. Please check the instruction again',
          });
        }
      });
    res.status(200).json({
      message: 'Upload data success -> Start training process',
    });
  },
);

export default router;
