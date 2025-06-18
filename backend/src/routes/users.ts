import express from "express"
import prisma from "../config/database"
import { authenticateUser } from "../middleware/auth"
import type { AuthRequest } from "../types"

const router = express.Router()

// Get user profile
router.get("/profile", authenticateUser, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        isHost: true,
        isVerified: true,
        joinDate: true,
        _count: {
          select: {
            listings: true,
            bookings: true,
            reviews: true,
            favorites: true,
          },
        },
      },
    })

    res.json({
      success: true,
      data: user,
    })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get profile",
      error: "Internal server error",
    })
  }
})

// Update user profile
router.put("/profile", authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { firstName, lastName, phone, avatar } = req.body

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        firstName,
        lastName,
        phone,
        avatar,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatar: true,
        isHost: true,
        isVerified: true,
        joinDate: true,
      },
    })

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: "Internal server error",
    })
  }
})

// Become a host
router.post("/become-host", authenticateUser, async (req: AuthRequest, res) => {
  try {
    if (req.user!.isHost) {
      return res.status(400).json({
        success: false,
        message: "You are already a host",
      })
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: { isHost: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isHost: true,
      },
    })

    res.json({
      success: true,
      message: "Congratulations! You are now a host.",
      data: updatedUser,
    })
  } catch (error) {
    console.error("Become host error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to become a host",
      error: "Internal server error",
    })
  }
})

// Get user's dashboard stats
router.get("/dashboard", authenticateUser, async (req: AuthRequest, res) => {
  try {
    const [bookingsCount, favoritesCount, reviewsCount, upcomingBookings, recentBookings] = await Promise.all([
      prisma.booking.count({
        where: { userId: req.user!.id },
      }),
      prisma.favorite.count({
        where: { userId: req.user!.id },
      }),
      prisma.review.count({
        where: { userId: req.user!.id },
      }),
      prisma.booking.findMany({
        where: {
          userId: req.user!.id,
          checkIn: { gte: new Date() },
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        take: 5,
        orderBy: { checkIn: "asc" },
        include: {
          listing: {
            select: {
              title: true,
              location: true,
              images: true,
            },
          },
        },
      }),
      prisma.booking.findMany({
        where: { userId: req.user!.id },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          listing: {
            select: {
              title: true,
              location: true,
              images: true,
            },
          },
        },
      }),
    ])

    res.json({
      success: true,
      data: {
        stats: {
          bookingsCount,
          favoritesCount,
          reviewsCount,
        },
        upcomingBookings,
        recentBookings,
      },
    })
  } catch (error) {
    console.error("Get dashboard error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get dashboard data",
      error: "Internal server error",
    })
  }
})

export default router
