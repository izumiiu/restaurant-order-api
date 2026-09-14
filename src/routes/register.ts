import express from 'express';
const router = express.Router();
import registerController from '../controller/registerController.js';
import { registerLog } from '../middleware/logEvents.js';

router.post('/', registerLog, registerController)



export default router