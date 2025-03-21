import express from 'express';
import attachImage from '../../../middlewares/attach.image.js';
import authenticateUser from '../../../middlewares/authenticate.user.js';
import checkRole from '../../../middlewares/check.role.js';
import UploadFile from '../../../middlewares/file.upload.js';
import validateRequest from '../../../middlewares/validate.request.js';
import RefreshTokenModel from '../../refresh_token/model/refresh_token.model.js';
import {
  getAll,
  getById,
  login,
  logout,
  refreshToken,
  register,
  update,
  verifyEmail
} from '../controller/user.controller.js';
import UserModel from '../model/user.model.js';
import {
  createUserSchema,
  deleteUserSchema,
  getUserByIdSchema,
  getUsersSchema,
  loginSchema,
  updateProfileSchema,
  verifyEmailSchema
} from '../validation/user.validation.js';

const userRouter = express.Router();

// Middleware object
const validate = {
  create: validateRequest(createUserSchema),
  login: validateRequest(loginSchema),
  verifyEmail: validateRequest(verifyEmailSchema),
  getUsers: validateRequest(getUsersSchema),
  getById: validateRequest(getUserByIdSchema),
  delete: validateRequest(deleteUserSchema),
  update: validateRequest(updateProfileSchema)
};

// Auth routes
userRouter
  .route('/auth/register')
  .post(UploadFile('avatar', 'users'), attachImage('avatar'), validate.create, register);

userRouter
  .route('/auth/login')
  .post(validate.login, login);

userRouter
  .route('/auth/refresh-token')
  .post(refreshToken);

userRouter
  .route('/auth/logout')
  .post(authenticateUser, logout);

userRouter
  .route('/auth/update/:id')
  .put(authenticateUser, UploadFile('avatar', 'users'), attachImage('avatar'), validate.update, update);

// Email verification
userRouter
  .route('/verify-email/:token')
  .get(validate.verifyEmail, verifyEmail);

userRouter
  .route('/auth/update/:id')
  .put(UploadFile('avatar', 'users'), attachImage('avatar'), validate.update, update);

userRouter
  .route('/:id')
  .get(authenticateUser, validate.getById, getById)
  .delete(authenticateUser, checkRole('admin'), validate.delete);

// Admin routes
const adminRouter = express.Router();

// Protected user routes
userRouter
  .route('/get/all')
  .get(
    authenticateUser,
    checkRole('admin'),
    validate.getUsers,
    getAll
  );

adminRouter
  .route('/delete-all-users')
  .delete(
    authenticateUser,
    checkRole('admin'),
    async (req, res) => {
      await UserModel.deleteMany({});
      await RefreshTokenModel.deleteMany({});
      res.status(200).json({message: 'All users deleted successfully'});
    }
  );

// Attach admin routes
userRouter.use('/admin', adminRouter);

export default userRouter;
