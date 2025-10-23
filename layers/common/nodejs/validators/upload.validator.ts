import Joi from 'joi';

export const uploadSchema = Joi.object({
  fileName: Joi.string().required(),
  fileType: Joi.string().required(),
  folder: Joi.string().pattern(/^[a-zA-Z0-9-_\/]+$/).default('uploads')
});
