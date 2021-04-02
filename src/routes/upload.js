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
        const foundRecords = await Content.find({
          itemId: {
            $in: [...dataFromFile.map((item) => item.itemId)],
          },
          content: {
            $in: [...dataFromFile.map((item) => item.content)],
          },
          customer: {
            $in: [...dataFromFile.map((item) => item.customer)],
          },
        });
        const diff = _.differenceWith(
          dataFromFile,
          foundRecords.map((item) => {
            return {
              itemId: item.itemId,
              content: item.content,
              customer: item.customer,
            };
          }),
          _.isEqual,
        );
        const contents = await Content.insertMany(diff);
        if (contents)
          listener.emit(
            'sendMessage',
            JSON.stringify({
              user_id: customer._id,
              command: 'train',
              algorithm: 'content',
              params: '',
            }),
          );
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
        dataFromFile.push({
          userId: row[0],
          itemId: row[1],
          feedBack: parseFloat(row[2]),
          explicit: isExplicit,
          customer: customer._id,
        });
      })
      .on('end', async (rowCount) => {
        // console.log('Read file complete', rowCount);
        try {
          const foundRecords = await Collaborative.find({
            userId: {
              $in: [...dataFromFile.map((item) => item.userId)],
            },
            itemId: {
              $in: [...dataFromFile.map((item) => item.itemId)],
            },
            feedBack: {
              $in: [...dataFromFile.map((item) => item.feedBack)],
            },
            explicit: {
              $in: [...dataFromFile.map((item) => item.explicit)],
            },
            customer: {
              $in: [...dataFromFile.map((item) => item.customer)],
            },
          });
          // console.log('found', foundRecords)
          // console.log('data', dataFromFile)

          const diff = _.differenceWith(
            dataFromFile,
            foundRecords.map((item) => {
              return {
                userId: item.userId,
                itemId: item.itemId,
                feedBack: item.feedBack,
                explicit: item.explicit,
                customer: item.customer,
              };
            }),
            _.isEqual,
          );
          const collaboratives = await Collaborative.insertMany(diff);
          if (collaboratives)
            listener.emit(
              'sendMessage',
              JSON.stringify({
                user_id: customer._id,
                command: 'train',
                algorithm: 'collaborative',
                params: isExplicit === 'true' ? 'explicit' : 'implicit',
              }),
            );

          // const insertData = dataFromFile.map(async (row) => {
          //   const collaborative = await Collaborative.findOne({
          //     userId: row.userId,
          //     itemId: row.itemId,
          //     feedBack: row.feedBack,
          //     explicit: row.explicit,
          //     customer: row.customer,
          //   });
          //   if (collaborative) {
          //     console.log('Collaborative already existed. Skip');
          //     return;
          //   } else {
          //     const result = await Collaborative.create({
          //       userId: row.userId,
          //       itemId: row.itemId,
          //       feedBack: row.feedBack,
          //       explicit: row.explicit,
          //       customer: row.customer,
          //     });
          //     return result;
          //   }

          // });

          // await PromiseBar.all(insertData, { label: 'Minify' }).then(() => {
          //   listener.emit(
          //     'sendMessage',
          //     JSON.stringify({
          //       user_id: customer._id,
          //       command: 'train',
          //       algorithm: 'collaborative',
          //       params: isExplicit === 'true' ? 'explicit' : 'implicit',
          //     }),
          //   );
          // });
        } catch (error) {
          console.log('Error: ', error.message);
          // res.status(400).json({
          //   message:
          //     'Invalid upload file format. Please check the instruction again',
          // });
        }
      });
    res.status(200).json({
      message: 'Upload data success -> Start training process',
    });
  },
);

export default router;
