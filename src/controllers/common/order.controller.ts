import { Request, Response, NextFunction } from 'express';
import { orderService } from '../../services/order.service';
import { telegramService } from '../../services/telegram.service';
import { ApiResponse, ApiError } from '../../utils/ApiResponse';
import logger from '../../utils/logger';

export class OrderController {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const orderData = req.body;
      
      // Add user ID if authenticated
      if (req.user) {
        orderData.customer.userId = req.user._id;
      }

      const order = await orderService.createOrder(orderData);

      // Send Telegram notification (non-blocking)
      await telegramService.sendOrderNotification(order)
      res.status(201).json(ApiResponse.success(order, 'Order created successfully').build());
    } catch (error: any) {
      logger.error('Error creating order:', error);
      next(new ApiError(400, error.message || 'Failed to create order'));
    }
  }

  async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        status: req.query.status as string,
        paymentStatus: req.query.paymentStatus as string,
        customerEmail: req.query.customerEmail as string,
        customerPhone: req.query.customerPhone as string,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
        search: req.query.search as string,
      };

      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: req.query.sortOrder as string || 'desc',
      };

      const result = await orderService.getOrders(filters, pagination);
      
      res.json(ApiResponse.success(result, 'Orders retrieved successfully').build());
    } catch (error: any) {
      logger.error('Error getting orders:', error);
      next(new ApiError(500, error.message || 'Failed to get orders'));
    }
  }

  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(id);
      
      if (!order) {
        throw new ApiError(404, 'Order not found');
      }

      // Check if user can access this order
      if (req.user && order.customer.userId?.toString() !== req.user._id) {
        throw new ApiError(403, 'Access denied');
      }

      res.json(ApiResponse.success(order, 'Order retrieved successfully').build());
    } catch (error: any) {
      if (error instanceof ApiError) {
        next(error);
      } else {
        logger.error('Error getting order by ID:', error);
        next(new ApiError(500, error.message || 'Failed to get order'));
      }
    }
  }

  async getOrderByNumber(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderNumber } = req.params;
      const order = await orderService.getOrderByNumber(orderNumber);
      
      if (!order) {
        throw new ApiError(404, 'Order not found');
      }

      // Check if user can access this order
      if (req.user && order.customer.userId?.toString() !== req.user._id) {
        throw new ApiError(403, 'Access denied');
      }

      res.json(ApiResponse.success(order, 'Order retrieved successfully').build());
    } catch (error: any) {
      if (error instanceof ApiError) {
        next(error);
      } else {
        logger.error('Error getting order by number:', error);
        next(new ApiError(500, error.message || 'Failed to get order'));
      }
    }
  }

  async getUserOrders(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }

      const filters = {
        ...req.query,
        userId: req.user._id?.toString(),
      };

      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: req.query.sortOrder as string || 'desc',
      };

      const result = await orderService.getOrders(filters, pagination);
      
      res.json(ApiResponse.success(result, 'User orders retrieved successfully').build());
    } catch (error: any) {
      if (error instanceof ApiError) {
        next(error);
      } else {
        logger.error('Error getting user orders:', error);
        next(new ApiError(500, error.message || 'Failed to get user orders'));
      }
    }
  }
}

export const orderController = new OrderController();
