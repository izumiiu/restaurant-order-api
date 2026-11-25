import express from 'express';
const router = express.Router();
import { getAllOrders, addOrders, setStatus, getOrderByOrderCode } from '../../controller/orderController.js';
import verifyRoles from '../../middleware/verifyRoles.js';
import verifyJWT from '../../middleware/verifyJWT.js';
import { postOrderLimiter, findOrderLimiter } from '../../middleware/rateLimiters.js';
router.route('/')
.get(verifyJWT, verifyRoles('employee'), getAllOrders)
.post(postOrderLimiter, addOrders);

router.route('/findOrder').post(findOrderLimiter, getOrderByOrderCode);

// router.route('/me').get(verifyRoles('customer'), getMyOrders);

router.route('/:id/status').patch(verifyJWT, verifyRoles('employee'), setStatus);

// router.route('/:id').get(verifyRoles('customer', 'employee'), getOrderById);


export default router;