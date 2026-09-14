import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import * as user from '../controllers/userController.js';

const router = Router();

// ── Current user ──────────────────────────────────────────────────────────────
router.get   ('/profile',          protect, user.getProfile);
router.patch ('/profile',          protect, user.updateProfile);
router.delete('/profile',          protect, user.deactivateAccount);

// ── Public vet & shelter directories ─────────────────────────────────────────
router.get('/vets',                         user.listVets);
router.get('/vets/:id',                     user.getVetById);
router.get('/shelters',                     user.listShelters);

export default router;
