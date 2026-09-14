import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import * as article from '../controllers/careArticleController.js';

const router = Router();

// Public
router.get ('/',           article.getArticles);
router.get ('/id/:id',     article.getArticleById);
router.get ('/:slug',      article.getArticleBySlug);

// Admin/seed
router.post  ('/',    protect, article.createArticle);
router.patch ('/:id', protect, article.updateArticle);

export default router;
