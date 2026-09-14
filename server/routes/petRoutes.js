import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import * as pet from '../controllers/petController.js';

const router = Router();

// All pet routes require authentication. Only petOwners own pets.
// Vets can read (via getPetById) but not create/update/delete.

router.use(protect);

router.route('/')
  .get(restrictTo('petOwner'), pet.getMyPets)
  .post(restrictTo('petOwner'), pet.addPet);

router.route('/:id')
  .get(pet.getPetById)                              // petOwner + vet (guarded inside)
  .patch(restrictTo('petOwner'), pet.updatePet)
  .delete(restrictTo('petOwner'), pet.deletePet);

router.post('/:id/images',    restrictTo('petOwner'), pet.addImages);
router.post('/:id/documents', restrictTo('petOwner'), pet.addDocuments);

export default router;
