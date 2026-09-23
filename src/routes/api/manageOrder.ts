import express from 'express';
const router = express.Router();
import { getAllOrders, addOrders, getMyOrders, getOrderById, setStatus } from '../../controller/orderController.js';
import verifyRoles from '../../middleware/verifyRoles.js';

router.route('/')
.get(verifyRoles('employee'), getAllOrders)
.post(verifyRoles('customer'), addOrders);

router.route('/me').get(verifyRoles('customer'), getMyOrders);

router.route('/:id/status').patch(verifyRoles('employee'), setStatus);

router.route('/:id').get(verifyRoles('customer', 'employee'), getOrderById);


export default router;