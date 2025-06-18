import express from "express"
import prisma from "../config/database"
import { authenticateUser } from "../middleware/auth"
import type { AuthRequest } from "../types"

const router = express.Router()

// Add to favorites
router.post("/:listingId", authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { listingId } = req.params

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, title: true },
    })

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      })
    }

    // Check if already in favorites
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId: req.user!.id,
          listingId,
        },
      },
    })

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: "Listing is already in your favorites",
      })
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: req.user!.id,
        listingId,
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            location: true,
            price: true,
            rating: true,
            images: true,
          },
        },
      },
    })

    res.status(201).json({
      success: true,
      message: "Added to favorites",
      data: favorite,
    })
  } catch (error) {
    console.error("Add favorite error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to add to favorites",
      error: "Internal server error",
    })
  }
})

// Remove from favorites
router.delete("/:listingId", authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { listingId } = req.params

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId: req.user!.id,
          listingId,
        },
      },
    })

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "Listing not found in favorites",
      })
    }

    await prisma.favorite.delete({
      where: {
        userId_listingId: {
          userId: req.user!.id,
          listingId,
        },
      },
    })

    res.json({
      success: true,
      message: "Removed from favorites",
    })
  } catch (error) {
    console.error("Remove favorite error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to remove from favorites",
      error: "Internal server error",
    })
  }
})

// Get user's favorites
router.get("/", authenticateUser, async (req: AuthRequest, res) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 12
    const skip = (page - 1) * limit

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId: req.user!.id },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          listing: {
            include: {
              host: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
              _count: {
                select: {
                  reviews: true,
                },
              },
            },
          },
        },
      }),
      prisma.favorite.count({
        where: { userId: req.user!.id },
      }),
    ])

    res.json({
      success: true,
      data: favorites,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get favorites error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get favorites",
      error: "Internal server error",
    })
  }
})

// Check if listing is favorited
router.get("/check/:listingId", authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { listingId } = req.params

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId: req.user!.id,
          listingId,
        },
      },
    })

    res.json({
      success: true,
      data: {
        isFavorited: !!favorite,
      },
    })
  } catch (error) {
    console.error("Check favorite error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to check favorite status",
      error: "Internal server error",
    })
  }
})

export default router
