import express from "express"
import prisma from "../config/database"
import { authenticateUser } from "../middleware/auth"
import { validate, createBookingSchema } from "../middleware/validation"
import type { AuthRequest } from "../types"

const router = express.Router()

// Create booking
router.post("/", authenticateUser, validate(createBookingSchema), async (req: AuthRequest, res) => {
  try {
    const { listingId, checkIn, checkOut, guests } = req.body

    // Check if listing exists and is available
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        title: true,
        price: true,
        guests: true,
        hostId: true,
        status: true,
      },
    })

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      })
    }

    if (listing.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "Listing is not available for booking",
      })
    }

    if (guests > listing.guests) {
      return res.status(400).json({
        success: false,
        message: `This listing can accommodate maximum ${listing.guests} guests`,
      })
    }

    // Check for conflicting bookings
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        listingId,
        status: { in: ["PENDING", "CONFIRMED"] },
        OR: [
          {
            checkIn: { lte: new Date(checkIn) },
            checkOut: { gt: new Date(checkIn) },
          },
          {
            checkIn: { lt: new Date(checkOut) },
            checkOut: { gte: new Date(checkOut) },
          },
          {
            checkIn: { gte: new Date(checkIn) },
            checkOut: { lte: new Date(checkOut) },
          },
        ],
      },
    })

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message: "Selected dates are not available",
      })
    }

    // Calculate total price
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    const subtotal = Number(listing.price) * nights
    const cleaningFee = 50
    const serviceFee = Math.round(subtotal * 0.14)
    const taxes = Math.round(subtotal * 0.12)
    const totalPrice = subtotal + cleaningFee + serviceFee + taxes

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: req.user!.id,
        listingId,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        guests,
        totalPrice,
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            location: true,
            images: true,
            host: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    })

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    })
  } catch (error) {
    console.error("Create booking error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to create booking",
      error: "Internal server error",
    })
  }
})

// Get user's bookings
router.get("/my-bookings", authenticateUser, async (req: AuthRequest, res) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
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
              host: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
            },
          },
        },
      }),
      prisma.booking.count({
        where: { userId: req.user!.id },
      }),
    ])

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get bookings error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get bookings",
      error: "Internal server error",
    })
  }
})

// Get single booking
router.get("/:id", authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        listing: {
          include: {
            host: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        payment: true,
      },
    })

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      })
    }

    // Check if user owns this booking or is the host
    if (booking.userId !== req.user!.id && booking.listing.hostId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      })
    }

    res.json({
      success: true,
      data: booking,
    })
  } catch (error) {
    console.error("Get booking error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get booking",
      error: "Internal server error",
    })
  }
})

// Cancel booking
router.patch("/:id/cancel", authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    const booking = await prisma.booking.findUnique({
      where: { id },
      select: {
        userId: true,
        status: true,
        checkIn: true,
      },
    })

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      })
    }

    if (booking.userId !== req.user!.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only cancel your own bookings.",
      })
    }

    if (booking.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled",
      })
    }

    if (booking.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel completed booking",
      })
    }

    // Check if booking can be cancelled (e.g., not within 24 hours of check-in)
    const now = new Date()
    const checkInDate = new Date(booking.checkIn)
    const hoursUntilCheckIn = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilCheckIn < 24) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel booking within 24 hours of check-in",
      })
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: {
        listing: {
          select: {
            title: true,
            location: true,
          },
        },
      },
    })

    res.json({
      success: true,
      message: "Booking cancelled successfully",
      data: updatedBooking,
    })
  } catch (error) {
    console.error("Cancel booking error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
      error: "Internal server error",
    })
  }
})

// Get host's bookings
router.get("/host/bookings", authenticateUser, async (req: AuthRequest, res) => {
  try {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10
    const skip = (page - 1) * limit

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where: {
          listing: {
            hostId: req.user!.id,
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
              email: true,
              phone: true,
            },
          },
          listing: {
            select: {
              title: true,
              location: true,
              images: true,
            },
          },
        },
      }),
      prisma.booking.count({
        where: {
          listing: {
            hostId: req.user!.id,
          },
        },
      }),
    ])

    res.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get host bookings error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to get bookings",
      error: "Internal server error",
    })
  }
})

export default router
