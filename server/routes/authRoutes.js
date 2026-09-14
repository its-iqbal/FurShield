import { Router } from 'express';
import validate from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import * as auth from '../controllers/authController.js';

const router = Router();

router.post('/register',         auth.registerRules, validate, auth.register);
router.post('/login',            auth.loginRules,    validate, auth.login);
router.post('/logout',           protect,                      auth.logout);
router.get ('/me',               protect,                      auth.getMe);
router.patch('/update-password', protect,                      auth.updatePassword);

export default router;
