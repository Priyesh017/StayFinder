import type { Request, Response, NextFunction } from "express"
import Joi from "joi"

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body)

    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.details[0].message,
      })
    }

    next()
  }
}

// User validation schemas
export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  phone: Joi.string().optional(),
  isHost: Joi.boolean().optional(),
})

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
})

// Listing validation schemas
export const createListingSchema = Joi.object({
  title: Joi.string().min(5).max(100).required(),
  description: Joi.string().min(20).max(1000).required(),
  location: Joi.string().required(),
  price: Joi.number().positive().required(),
  type: Joi.string().required(),
  guests: Joi.number().integer().min(1).required(),
  bedrooms: Joi.number().integer().min(0).required(),
  bathrooms: Joi.number().integer().min(1).required(),
  amenities: Joi.array().items(Joi.string()).required(),
  highlights: Joi.array().items(Joi.string()).required(),
  category: Joi.string().required(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
})

// Booking validation schemas
export const createBookingSchema = Joi.object({
  listingId: Joi.string().uuid().required(),
  checkIn: Joi.date().iso().required(),
  checkOut: Joi.date().iso().greater(Joi.ref("checkIn")).required(),
  guests: Joi.number().integer().min(1).required(),
})

// Review validation schemas
export const createReviewSchema = Joi.object({
  listingId: Joi.string().uuid().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().max(500).optional(),
})
