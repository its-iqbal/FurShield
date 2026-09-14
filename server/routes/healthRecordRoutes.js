import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import * as hr from '../controllers/healthRecordController.js';

const router = Router();

router.use(protect);

// Create: owner or vet (access controlled inside controller)
router.post('/', hr.createRecord);

// Records by pet — owner or vet with appointment
router.get('/pet/:petId', hr.getRecordsByPet);

// Single record
router.route('/:id')
  .get(hr.getRecordById)
  .patch(restrictTo('veterinarian'), hr.updateRecord)
  .delete(hr.deleteRecord);

export default router;
