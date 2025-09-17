import { Router } from 'express';
import { AdminOrderController } from '../../controllers/admin/order.controller';
import { requiredAuth, adminOnly } from '../../middleware/auth';
import { validate, validateRequest } from '../../middleware/validate';
import {
  updateOrderSchema,
  getOrdersSchema,
  orderIdSchema,
  bulkUpdateOrdersSchema
} from '../../validators/order.validator';

const router = Router();
const adminOrderController = new AdminOrderController();

// All admin routes require authentication
router.use(requiredAuth);
router.use(adminOnly);

// Order management routes
router.get(
  '/',
  validate({ query: getOrdersSchema }),
  adminOrderController.getOrders.bind(adminOrderController)
);

router.get(
  '/stats',
  adminOrderController.getOrderStats.bind(adminOrderController)
);

router.get(
  '/:id',
  validate({ params: orderIdSchema }),
  adminOrderController.getOrderById.bind(adminOrderController)
);

router.put(
  '/:id',
  validate({ params: orderIdSchema }),
  validateRequest(updateOrderSchema),
  adminOrderController.updateOrder.bind(adminOrderController)
);

router.delete(
  '/:id',
  validate({ params: orderIdSchema }),
  adminOrderController.deleteOrder.bind(adminOrderController)
);

router.put(
  '/bulk-update',
  validateRequest(bulkUpdateOrdersSchema),
  adminOrderController.bulkUpdateOrders.bind(adminOrderController)
);

export default router;
