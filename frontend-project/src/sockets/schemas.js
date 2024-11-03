import { storeAuthToken } from "@utils/tokenStorage";
// frontend-project/src/sockets/schemas.js

import Joi from 'joi';

export const joinOrderRoomSchema = Joi.object({
  orderId: Joi.string().required(),
});

export const statusChangeSchema = Joi.object({
  orderId: Joi.string().required(),
  status: Joi.string().required(),
});

export const orderStatusUpdateSchema = Joi.object({
  orderId: Joi.string().required(),
  status: Joi.string().required(),
  updatedAt: Joi.date().optional(),
});
