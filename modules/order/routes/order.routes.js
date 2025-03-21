import express from 'express';
import authenticateUser from '../../../middlewares/authenticate.user.js';
import CheckPreviousOrders from '../../../middlewares/check.previous.orders.js';
import checkRole from '../../../middlewares/check.role.js';
import validateRequest from '../../../middlewares/validate.request.js';
import {checkout, create, getAll, getById, getMyOrders, updateOrderStatus} from '../controller/order.controller.js';
import OrderModel from '../model/order.model.js';
import orderValidation from '../validation/order.validation.js';

const orderRouter = express.Router();

// Middleware object
const validate = {
  create: validateRequest(orderValidation.createSchema),
  get: validateRequest(orderValidation.getSchema),
  getById: validateRequest(orderValidation.getByIdSchema),
  update: validateRequest(orderValidation.updateOrderStatusSchema),
  checkout: validateRequest(orderValidation.checkoutSchema),
  delete: validateRequest(orderValidation.deleteSchema)
};

// Common middleware
// orderRouter.use(authenticateUser);

// Order routes
orderRouter
  .route('/')
  .post(authenticateUser, validate.create, CheckPreviousOrders, create)
  .get(authenticateUser, checkRole('admin'), validate.get, getAll);

orderRouter
  .route('/my-orders')
  .get(authenticateUser, validate.get, getMyOrders);

orderRouter
  .route('/checkout/:id')
  .post(authenticateUser, validate.checkout, checkout);

orderRouter
  .route('/:id')
  .get(authenticateUser, validate.getById, getById)
  .patch(authenticateUser, checkRole('admin'), validate.update, updateOrderStatus);
// .delete(authenticateUser, checkRole('admin'), );

// Admin routes
orderRouter
  .route('/admin')
  .get(authenticateUser, checkRole('admin'), async (req, res) => {
    const orders = await OrderModel.find({});
    res.json({
      status: 'success',
      data: orders
    });
  });

orderRouter
  .route('/admin/deleteAll')
  .delete(authenticateUser, checkRole('admin'), async (req, res) => {
    await OrderModel.deleteMany({});
    res.status(200).json({
      status: 'success',
      message: 'All orders deleted successfully'
    });
  });

orderRouter
  .route('/admin/update-status/:id')
  .put(authenticateUser, checkRole('admin'), validate.update, updateOrderStatus);

// orderRoutes.get('/', validateRequest(orderValidation.getAllSchema), orderController.get);
// orderRoutes.get('/:id', validateRequest(orderValidation.getByIdSchema), orderController.getById);
// orderRoutes.patch('/:id', validateRequest(orderValidation.updateSchema), orderController.update);
// orderRoutes.delete('/:id', validateRequest(orderValidation.deleteSchema), orderController.remove);

export default orderRouter;
