import express from 'express';
const router = express.Router();
import { healthChecker } from '../controller/health.js';

router.route('/').get(healthChecker);

export default router;