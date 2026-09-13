import express from 'express';
const router = express.Router();
import { addMenu, getAllRecipes, updateMenu, deleteMenu } from '../../controller/menuController.js';

router.route('/')
.get(getAllRecipes)
.post(addMenu)

router.route('/:id')
.put(updateMenu)
.delete(deleteMenu)

router.route('/incomingMenu')

export default router;