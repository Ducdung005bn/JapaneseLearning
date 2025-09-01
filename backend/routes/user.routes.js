import express from 'express';
import {authorize, allowSelfOrAdmin, allowAdminOnly} from '../middlewares/auth.middleware.js';
import * as userController from '../controllers/user.controller.js';
const router = express.Router();


router.get('/', authorize, allowAdminOnly, userController.getUsers);

router.get('/:id', authorize, allowSelfOrAdmin, userController.getUserById);

router.put('/:id', authorize, allowSelfOrAdmin, userController.updateUser);

router.delete('/:id', authorize, allowSelfOrAdmin, userController.deleteUser);

export default router;
