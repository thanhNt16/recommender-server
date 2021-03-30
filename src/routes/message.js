import { Router } from 'express';
import auth from '../middleware';
const router = Router();
import { listener } from '../services/rabbitService';

router.post('/request-training', auth, async (req, res) => {
  const algorithm = req.query.algorithm;
  const isExplicit = req.body.isExplicit;
  const params = isExplicit
    ? isExplicit === 'true'
      ? 'explicit'
      : 'implicit'
    : '';
  if (!algorithm) {
    res
      .status(400)
      .json({ message: 'Error! Algorithm is required in query parameter' });
  }
  if (!req.customer) {
    res.status(400).json({ message: 'Error! Token has expired' });
  }

  if (algorithm && req.customer) {
    listener.emit(
      'sendMessage',
      JSON.stringify({
        user_id: req.customer._id,
        command: 'train',
        algorithm: algorithm,
        params,
      }),
    );
    res.status(200).json({
      message: `Send ${JSON.stringify({
        user_id: req.customer._id,
        command: 'train',
        algorithm: algorithm,
        params,
      })}`,
    });
  }
});

export default router;
