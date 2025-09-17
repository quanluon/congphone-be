import { Router } from 'express';
import { OrderController } from '../../controllers/common/order.controller';
import { optionalAuth, requiredAuth } from '../../middleware/auth';
import { validate, validateRequest } from '../../middleware/validate';
import {
  createOrderSchema,
  getOrdersSchema,
  orderIdSchema,
  orderNumberSchema
} from '../../validators/order.validator';

const router = Router();
const orderController = new OrderController();

// Public routes
router.post(
  '/',
  optionalAuth,
  validateRequest(createOrderSchema),
  orderController.createOrder.bind(orderController)
);

router.get(
  '/number/:orderNumber',
  optionalAuth,
  validate({ params: orderNumberSchema }),
  orderController.getOrderByNumber.bind(orderController)
);

// Protected routes
router.get(
  '/',
  requiredAuth,
  validate({ query: getOrdersSchema }),
  orderController.getUserOrders.bind(orderController)
);

router.get(
  '/:id',
  requiredAuth,
  validate({ params: orderIdSchema }),
  orderController.getOrderById.bind(orderController)
);

export default router;
