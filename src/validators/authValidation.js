import Joi from "joi";


export const registerSchema = Joi.object({
  fullName: Joi.string().min(2).required().messages({
    "string.empty": "Full name is required",
    "string.min": "Full name must be at least 2 characters",
  }),

  username: Joi.string().alphanum().min(3).max(30).required().messages({
    "string.empty": "Username is required",
    "string.min": "Username must be at least 3 characters",
    "string.max": "Username must not exceed 30 characters",
    "string.alphanum": "Username must contain only letters and numbers",
  }),

  email: Joi.string().email().optional().messages({
    "string.email": "Invalid email format",
  }),

  phoneNumber: Joi.string()
    .pattern(/^\+?[0-9]{7,15}$/)
    .required()
    .messages({
      "string.empty": "Phone number is required",
      "string.pattern.base": "Invalid phone number",
    }),

  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters",
  }),

  role: Joi.number().valid(0, 1, 2).optional(),
});



export const loginSchema = Joi.object({
  identifier: Joi.string().required().messages({
    "string.empty": "Username, email or phone is required",
  }),

  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
});
