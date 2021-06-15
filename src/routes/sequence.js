import { Router } from 'express';
import auth from '../middleware';
import { list, create, findById, update, deleteController, countByItemId } from '../controllers/sequenceController'
const router = Router();

router.get('/', auth, list);
router.get('/count-by-itemid', auth, countByItemId);

router.post('/create', auth, create);

router.get('/:id', auth, findById);
router.put('/:id', auth, update);

router.delete('/:id', deleteController);
export default router;
