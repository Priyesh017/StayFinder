import type { Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import prisma from "../config/database"
import type { AuthRequest } from "../types"

export const authenticateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        isVerified: true,
        isHost: true,
        joinDate: true,
      },
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found.",
      })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token.",
    })
  }
}

export const authenticateAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
    })

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Admin not found.",
      })
    }

    req.admin = admin
    next()
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token.",
    })
  }
}

export const requireHost = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user?.isHost) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Host privileges required.",
    })
  }
  next()
}

export const requireSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.admin?.role !== "SUPER_ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Super admin privileges required.",
    })
  }
  next()
}
