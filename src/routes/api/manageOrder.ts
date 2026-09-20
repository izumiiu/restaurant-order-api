import express from 'express';
const router = express.Router();
import { getAllOrders, addOrders } from '../../controller/orderController.js';
import verifyRoles from '../../middleware/verifyRoles.js';

router.route('/')
.get(verifyRoles('employee'), getAllOrders)
.post(verifyRoles('employee', 'customer'), addOrders);


export default router;