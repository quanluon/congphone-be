import { NextFunction, Request, Response } from 'express';
import { orderService, PaginationOptions } from '../../services/order.service';
import { ApiError, ApiResponse } from '../../utils/ApiResponse';
import logger from '../../utils/logger';

const isProduction = process.env.NODE_ENV === 'production';

export class AdminOrderController {
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

      const result = await orderService.getOrders(filters, pagination as PaginationOptions);
      
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

  async updateOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const order = await orderService.updateOrder(id, updateData);
      
      if (!order) {
        throw new ApiError(404, 'Order not found');
      }

 
      res.json(ApiResponse.success(order, 'Order updated successfully').build());
    } catch (error: any) {
      if (error instanceof ApiError) {
        next(error);
      } else {
        logger.error('Error updating order:', error);
        next(new ApiError(500, error.message || 'Failed to update order'));
      }
    }
  }

  async deleteOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const deleted = await orderService.deleteOrder(id);
      
      if (!deleted) {
        throw new ApiError(404, 'Order not found');
      }

      res.json(ApiResponse.success(null, 'Order deleted successfully').build());
    } catch (error: any) {
      if (error instanceof ApiError) {
        next(error);
      } else {
        logger.error('Error deleting order:', error);
        next(new ApiError(500, error.message || 'Failed to delete order'));
      }
    }
  }

  async getOrderStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await orderService.getOrderStats();
      
      res.json(ApiResponse.success(stats, 'Order statistics retrieved successfully').build());
    } catch (error: any) {
      logger.error('Error getting order stats:', error);
      next(new ApiError(500, error.message || 'Failed to get order statistics'));
    }
  }

  async bulkUpdateOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderIds, updateData } = req.body;
      
      if (!Array.isArray(orderIds) || orderIds.length === 0) {
        throw new ApiError(400, 'Order IDs array is required');
      }

      const results = [];
      for (const orderId of orderIds) {
        try {
          const order = await orderService.updateOrder(orderId, updateData);
          if (order) {
            results.push({ id: orderId, success: true, order });
          } else {
            results.push({ id: orderId, success: false, error: 'Order not found' });
          }
        } catch (error: any) {
          results.push({ id: orderId, success: false, error: error.message });
        }
      }

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      res.json(ApiResponse.success({
        results,
        summary: {
          total: orderIds.length,
          success: successCount,
          failed: failureCount
        }
      }, `Bulk update completed: ${successCount} successful, ${failureCount} failed`).build());
    } catch (error: any) {
      if (error instanceof ApiError) {
        next(error);
      } else {
        logger.error('Error in bulk update orders:', error);
        next(new ApiError(500, error.message || 'Failed to bulk update orders'));
      }
    }
  }
}

export const adminOrderController = new AdminOrderController();
