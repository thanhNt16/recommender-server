import { Router } from 'express';
import auth from '../middleware';
import Content from '../models/content';
const router = Router();
import multer from 'multer';
import fs from 'fs';
import PromiseBar from 'promise.bar';
import { parse } from '@fast-csv/parse';
import _ from 'lodash';
import { listener } from '../services/rabbitService';
PromiseBar.enable();

// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads');
  },
  filename: function (req, file, cb) {
    const params = req.url.split('/');
    cb(
      null,
      req.customer._id +
        `-${params[1]}-${params[2]}` +
        '.' +
        file.originalname.split('.')[1],
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
      .on('error', (error) => res.status(400).json({
        message: error.message,
      }))
      .on('data', async (row) => {
        dataFromFile.push({
          itemId: row[0],
          content: row[2] ? `${row[1]}${row[2]}`: `${row[1]}}`,
          customer: customer._id,
        });
      })
      .on('end', async (rowCount) => {
        console.log('Read file complete', rowCount, dataFromFile);
        
        try {
          await Content.insertMany(dataFromFile);
          listener.emit(
            'sendMessage',
            JSON.stringify({
              user_id: customer._id,
              command: 'train',
              algorithm: 'content',
              params: '',
            }),
          );
          res.status(200).json({
            message: 'Upload data success -> Start training process',
          });
        } catch (error) {
          if (error) {
            res.status(400).json({
              message: 'Incorrect format for this algorithm',
            });
          }
        }
        // if (contents)
          
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
        dataFromFile.push({
          userId: row[0],
          itemId: row[1],
          feedBack: parseFloat(row[2]),
          explicit: isExplicit,
          customer: customer._id,
        });
      })
      .on('end', async (rowCount) => {
        try {
          await Collaborative.insertMany(dataFromFile);
          // if (collaboratives)
          listener.emit(
            'sendMessage',
            JSON.stringify({
              user_id: customer._id,
              command: 'train',
              algorithm: 'collaborative',
              params: isExplicit === 'true' ? 'explicit' : 'implicit',
            }),
          );
          res.status(200).json({
            message: 'Upload data success -> Start training process',
          });
        } catch (error) {
          console.log('Error: ', error.message);
          if (error) {
            res.status(400).json({
              message: 'Incorrect format for this algorithm',
            });
          }
        }
      });
  },
);
router.post('/sequence', auth, upload.single('sequence'), (req, res, next) => {
  const file = req.file;
  const customer = req.customer;
  const Sequence = req.context.models.Sequence;
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
        date: row[3],
        customer: customer._id,
      });
    })
    .on('end', async (rowCount) => {
      try {
        // const foundRecords = await Sequence.find({
        //   userId: {
        //     $in: [...dataFromFile.map((item) => item.userId)],
        //   },
        //   itemId: {
        //     $in: [...dataFromFile.map((item) => item.itemId)],
        //   },
        //   feedBack: {
        //     $in: [...dataFromFile.map((item) => item.feedBack)],
        //   },
        //   date: {
        //     $in: [...dataFromFile.map((item) => item.date)],
        //   },
        //   customer: {
        //     $in: [...dataFromFile.map((item) => item.customer)],
        //   },
        // });

        // const diff = _.differenceWith(
        //   dataFromFile,
        //   foundRecords.map((item) => {
        //     return {
        //       userId: item.userId,
        //       itemId: item.itemId,
        //       feedBack: item.feedBack,
        //       date: item.date,
        //       customer: item.customer,
        //     };
        //   }),
        //   _.isEqual,
        // );
        // console.log("diff", diff)
        // if (diff.length !== 0) {
        await Sequence.insertMany(dataFromFile);
        // }
        listener.emit(
          'sendMessage',
          JSON.stringify({
            user_id: customer._id,
            command: 'train',
            algorithm: 'sequence',
            params: '',
          }),
        );
        res.status(200).json({
          message: 'Upload data success -> Start training process',
        });
      } catch (error) {
        console.log('Error: ', error.message);
        if (error) {
          res.status(400).json({
            message: 'Incorrect format for this algorithm',
          });
        }
      }
    });
  // listener.emit(
  //   'sendMessage',
  //   JSON.stringify({
  //     user_id: customer._id,
  //     command: 'train',
  //     algorithm: 'sequence',
  //     params: '',
  //   }),
  // );
});

export default router;
