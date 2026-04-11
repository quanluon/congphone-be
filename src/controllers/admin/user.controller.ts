import { NextFunction, Request, Response } from "express";
import { User } from "../../models/user.model";
import { ApiError, ApiResponse } from "../../utils/ApiResponse";

export class AdminUserController {
  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const { search, type, status } = req.query;

      const query: any = {};

      if (search) {
        query.$or = [
          { email: { $regex: search, $options: 'i' } },
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ];
      }

      if (type) query.type = type;
      if (status) query.status = status;

      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        User.countDocuments(query)
      ]);

      res.json(
        ApiResponse.success(
          users,
          "Users retrieved successfully",
          {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        ).build()
      );
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status, type } = req.body;

      if (!status && !type) {
        throw new ApiError(400, "Nothing to update", null, "badRequest");
      }

      const updateData: any = {};
      if (status) updateData.status = status;
      if (type) updateData.type = type;

      const user = await User.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );

      if (!user) {
        throw new ApiError(404, "User not found", null, "userNotFound");
      }

      res.json(ApiResponse.success(user, "User updated successfully").build());
    } catch (error) {
      next(error);
    }
  }
}

export const adminUserController = new AdminUserController();
