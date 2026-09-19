import express from 'express';
const router = express.Router();
import { addMenu, getAllRecipes, updateMenu, deleteMenu } from '../../controller/menuController.js';
import verifyRoles from '../../middleware/verifyRoles.js';

router.route('/')
.get(verifyRoles('customer', 'employee'),getAllRecipes)
.post(verifyRoles('employee'), addMenu)

router.route('/:id')
.put(verifyRoles('employee'), updateMenu)
.delete(verifyRoles('employee'), deleteMenu)


export default router;