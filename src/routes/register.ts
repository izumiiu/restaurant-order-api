import express from 'express';
const router = express.Router();
import registerController from '../controller/registerController.js';

router.post('/', registerController)



export default router;