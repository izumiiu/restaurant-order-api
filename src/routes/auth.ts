import express from 'express';
const router = express.Router();
import handleLogin from '../controller/authController.js';

router.post('/', handleLogin);


export default router;