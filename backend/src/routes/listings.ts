import express from "express"
import prisma from "../config/database"
import { authenticateUser, requireHost } from "../middleware/auth"
import { validate, createListingSchema } from "../middleware/validation"
import type { AuthRequest } from "../types"

const router = express.Router()

// Get all listings with search and filters
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      location,
      category,
      minPrice,
      maxPrice,
      guests,
      amenities,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query

    const skip = (Number(page) - 1) * Number(limit)

    // Build where clause
    const where: any = {
      status: "ACTIVE",
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
        { location: { contains: search as string, mode: "insensitive" } },
      ]
    }

    if (location) {
      where.location = { contains: location as string, mode: "insensitive" }
    }

    if (category) {
      where.category = category
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = Number(minPrice)
      if (maxPrice) where.price.lte = Number(maxPrice)
    }

    if (guests) {
      where.guests = { gte: Number(guests) }
    }

    if (amenities) {
      const amenitiesArray = Array.isArray(amenities) ? amenities : [amenities]
      where.amenities = {
        hasEvery: amenitiesArray,
      }
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { [sortBy as string]: sortOrder },
        include: {
          host: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              isVerified: true,
            },
          },
          _count: {
            select: {
              reviews: true,
              bookings: true,
            },
          },
        },
      }),
      prisma.listing.count({ where }),
    ])

    res.json({
      success: true,
      data: listings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (error) {
    console.error("Get listings error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get listings",
      error: "Internal server error",
    })
  }
})

// Get single listing
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            isVerified: true,
            joinDate: true,
            _count: {
              select: {
                listings: true,
              },
            },
          },
        },
        reviews: {
          take: 10,
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
        },
        _count: {
          select: {
            reviews: true,
            bookings: true,
            favorites: true,
          },
        },
      },
    })

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      })
    }

    res.json({
      success: true,
      data: listing,
    })
  } catch (error) {
    console.error("Get listing error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get listing",
      error: "Internal server error",
    })
  }
})

// Create listing (host only)
router.post("/", authenticateUser, requireHost, validate(createListingSchema), async (req: AuthRequest, res) => {
  try {
    const listingData = req.body

    const listing = await prisma.listing.create({
      data: {
        ...listingData,
        hostId: req.user!.id,
        price: Number(listingData.price),
        latitude: listingData.latitude ? Number(listingData.latitude) : null,
        longitude: listingData.longitude ? Number(listingData.longitude) : null,
      },
      include: {
        host: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    })

    res.status(201).json({
      success: true,
      message: "Listing created successfully",
      data: listing,
    })
  } catch (error) {
    console.error("Create listing error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create listing",
      error: "Internal server error",
    })
  }
})

// Update listing (host only)
router.put("/:id", authenticateUser, requireHost, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    // Check if listing belongs to the host
    const existingListing = await prisma.listing.findUnique({
      where: { id },
      select: { hostId: true },
    })

    if (!existingListing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      })
    }

    if (existingListing.hostId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only update your own listings.",
      })
    }

    const listing = await prisma.listing.update({
      where: { id },
      data: {
        ...updateData,
        price: updateData.price ? Number(updateData.price) : undefined,
        latitude: updateData.latitude ? Number(updateData.latitude) : undefined,
        longitude: updateData.longitude ? Number(updateData.longitude) : undefined,
      },
      include: {
        host: {
          select: {
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    })

    res.json({
      success: true,
      message: "Listing updated successfully",
      data: listing,
    })
  } catch (error) {
    console.error("Update listing error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to update listing",
      error: "Internal server error",
    })
  }
})

// Delete listing (host only)
router.delete("/:id", authenticateUser, requireHost, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    // Check if listing belongs to the host
    const existingListing = await prisma.listing.findUnique({
      where: { id },
      select: { hostId: true },
    })

    if (!existingListing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      })
    }

    if (existingListing.hostId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only delete your own listings.",
      })
    }

    await prisma.listing.delete({
      where: { id },
    })

    res.json({
      success: true,
      message: "Listing deleted successfully",
    })
  } catch (error) {
    console.error("Delete listing error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to delete listing",
      error: "Internal server error",
    })
  }
})

// Get host's listings
router.get("/host/my-listings", authenticateUser, requireHost, async (req: AuthRequest, res) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where: { hostId: req.user!.id },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              bookings: true,
              reviews: true,
              favorites: true,
            },
          },
        },
      }),
      prisma.listing.count({
        where: { hostId: req.user!.id },
      }),
    ])

    res.json({
      success: true,
      data: listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get host listings error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get your listings",
      error: "Internal server error",
    })
  }
})

export default router
