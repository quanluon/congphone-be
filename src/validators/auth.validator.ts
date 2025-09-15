import { UserStatus, UserType } from '@/models/user.model';
import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  phone: Joi.string().optional(),
  userType: Joi.string().valid(UserType.CUSTOMER, UserType.ADMIN).default(UserType.CUSTOMER),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const confirmForgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  confirmationCode: Joi.string().length(6).required(),
  newPassword: Joi.string().min(8).required(),
});

export const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  phone: Joi.string().optional(),
  profileImage: Joi.string().uri().optional(),
});

export const getAllUsersSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  userType: Joi.string().valid(UserType.CUSTOMER, UserType.ADMIN).optional(),
  status: Joi.string().valid(UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.SUSPENDED).optional(),
});
