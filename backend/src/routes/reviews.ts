import express from "express";
import prisma from "../config/database";
import { authenticateUser } from "../middleware/auth";
import { validate, createReviewSchema } from "../middleware/validation";
import type { AuthRequest } from "../types";

const router = express.Router();

// Create review
router.post(
  "/",
  authenticateUser,
  validate(createReviewSchema),
  async (req: AuthRequest, res) => {
    try {
      const { listingId, rating, comment } = req.body;

      // Check if listing exists
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: { id: true, hostId: true },
      });

      if (!listing) {
        res.status(404).json({
          success: false,
          message: "Listing not found",
        });
        return;
      }

      // Check if user has a completed booking for this listing
      const completedBooking = await prisma.booking.findFirst({
        where: {
          userId: req.user!.id,
          listingId,
          status: "COMPLETED",
        },
      });

      if (!completedBooking) {
        res.status(400).json({
          success: false,
          message: "You can only review listings you have stayed at",
        });
        return;
      }

      // Check if user already reviewed this listing
      const existingReview = await prisma.review.findUnique({
        where: {
          userId_listingId: {
            userId: req.user!.id,
            listingId,
          },
        },
      });

      if (existingReview) {
        res.status(400).json({
          success: false,
          message: "You have already reviewed this listing",
        });
        return;
      }

      // Create review
      const review = await prisma.review.create({
        data: {
          userId: req.user!.id,
          listingId,
          rating,
          comment,
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      });

      // Update listing rating and review count
      const reviews = await prisma.review.findMany({
        where: { listingId },
        select: { rating: true },
      });

      const averageRating =
        reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviews.length;

      await prisma.listing.update({
        where: { id: listingId },
        data: {
          rating: Math.round(averageRating * 10) / 10,
          reviewCount: reviews.length,
        },
      });

      res.status(201).json({
        success: true,
        message: "Review created successfully",
        data: review,
      });
    } catch (error) {
      console.error("Create review error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create review",
        error: "Internal server error",
      });
    }
  }
);

// Get reviews for a listing
router.get("/listing/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params;
    const page = Number.parseInt(req.query.page as string) || 1;
    const limit = Number.parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { listingId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      }),
      prisma.review.count({
        where: { listingId },
      }),
    ]);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get reviews",
      error: "Internal server error",
    });
  }
});

// Get user's reviews
router.get("/my-reviews", authenticateUser, async (req: AuthRequest, res) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1;
    const limit = Number.parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { userId: req.user!.id },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              location: true,
              images: true,
            },
          },
        },
      }),
      prisma.review.count({
        where: { userId: req.user!.id },
      }),
    ]);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get user reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get your reviews",
      error: "Internal server error",
    });
  }
});

// Update review
router.put("/:id", authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const existingReview = await prisma.review.findUnique({
      where: { id },
      select: { userId: true, listingId: true },
    });

    if (!existingReview) {
      res.status(404).json({
        success: false,
        message: "Review not found",
      });
      return;
    }

    if (existingReview.userId !== req.user!.id) {
      res.status(403).json({
        success: false,
        message: "Access denied. You can only update your own reviews.",
      });
      return;
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: { rating, comment },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        listing: {
          select: {
            title: true,
            location: true,
          },
        },
      },
    });

    // Recalculate listing rating
    const reviews = await prisma.review.findMany({
      where: { listingId: existingReview.listingId },
      select: { rating: true },
    });

    const averageRating =
      reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    await prisma.listing.update({
      where: { id: existingReview.listingId },
      data: {
        rating: Math.round(averageRating * 10) / 10,
      },
    });

    res.json({
      success: true,
      message: "Review updated successfully",
      data: updatedReview,
    });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update review",
      error: "Internal server error",
    });
  }
});

// Delete review
router.delete("/:id", authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const existingReview = await prisma.review.findUnique({
      where: { id },
      select: { userId: true, listingId: true },
    });

    if (!existingReview) {
      res.status(404).json({
        success: false,
        message: "Review not found",
      });
      return;
    }

    if (existingReview.userId !== req.user!.id) {
      res.status(403).json({
        success: false,
        message: "Access denied. You can only delete your own reviews.",
      });
      return;
    }

    await prisma.review.delete({
      where: { id },
    });

    // Recalculate listing rating and review count
    const reviews = await prisma.review.findMany({
      where: { listingId: existingReview.listingId },
      select: { rating: true },
    });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : null;

    await prisma.listing.update({
      where: { id: existingReview.listingId },
      data: {
        rating: averageRating ? Math.round(averageRating * 10) / 10 : null,
        reviewCount: reviews.length,
      },
    });

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: "Internal server error",
    });
  }
});

export default router;
