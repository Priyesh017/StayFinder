import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../config/database";
import { authenticateAdmin } from "../middleware/auth";
import type { AuthRequest } from "../types";

const router = express.Router();

// Admin login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    const token = jwt.sign({ adminId: admin.id }, process.env.JWT_SECRET!, {
      expiresIn: 1000 * 60 * 60,
    });

    const { password: _, ...adminWithoutPassword } = admin;

    res.json({
      success: true,
      message: "Admin login successful",
      data: {
        admin: adminWithoutPassword,
        token,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: "Internal server error",
    });
  }
});

// Get dashboard stats
router.get("/dashboard", authenticateAdmin, async (req: AuthRequest, res) => {
  try {
    const [
      totalUsers,
      totalListings,
      totalBookings,
      totalRevenue,
      recentBookings,
      topListings,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.booking.count(),
      prisma.payment.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
      prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { firstName: true, lastName: true, email: true },
          },
          listing: {
            select: { title: true, location: true },
          },
        },
      }),
      prisma.listing.findMany({
        take: 10,
        orderBy: { reviewCount: "desc" },
        select: {
          id: true,
          title: true,
          location: true,
          rating: true,
          reviewCount: true,
          price: true,
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalListings,
          totalBookings,
          totalRevenue: totalRevenue._sum.amount || 0,
        },
        recentBookings,
        topListings,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get dashboard data",
      error: "Internal server error",
    });
  }
});

// Get all users
router.get("/users", authenticateAdmin, async (req: AuthRequest, res) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1;
    const limit = Number.parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          isHost: true,
          isVerified: true,
          joinDate: true,
          _count: {
            select: {
              listings: true,
              bookings: true,
            },
          },
        },
      }),
      prisma.user.count(),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get users",
      error: "Internal server error",
    });
  }
});

// Get all listings
router.get("/listings", authenticateAdmin, async (req: AuthRequest, res) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1;
    const limit = Number.parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          host: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          _count: {
            select: {
              bookings: true,
              reviews: true,
            },
          },
        },
      }),
      prisma.listing.count(),
    ]);

    res.json({
      success: true,
      data: listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get listings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get listings",
      error: "Internal server error",
    });
  }
});

// Update listing status
router.patch(
  "/listings/:id/status",
  authenticateAdmin,
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const listing = await prisma.listing.update({
        where: { id },
        data: { status },
        include: {
          host: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      res.json({
        success: true,
        message: "Listing status updated successfully",
        data: listing,
      });
    } catch (error) {
      console.error("Update listing status error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update listing status",
        error: "Internal server error",
      });
    }
  }
);

export default router;
