import express from "express";
import Stripe from "stripe";
import prisma from "../config/database";
import { authenticateUser } from "../middleware/auth";
import type { AuthRequest } from "../types";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

// Create payment intent
router.post(
  "/create-intent",
  authenticateUser,
  async (req: AuthRequest, res) => {
    try {
      const { bookingId } = req.body;

      // Get booking details
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          listing: {
            select: {
              title: true,
              price: true,
            },
          },
        },
      });

      if (!booking) {
        res.status(404).json({
          success: false,
          message: "Booking not found",
        });
        return;
      }

      if (booking.userId !== req.user!.id) {
        res.status(403).json({
          success: false,
          message: "Access denied",
        });
        return;
      }

      // Check if payment already exists
      const existingPayment = await prisma.payment.findUnique({
        where: { bookingId },
      });

      if (existingPayment && existingPayment.status === "COMPLETED") {
        res.status(400).json({
          success: false,
          message: "Payment already completed for this booking",
        });
        return;
      }

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(Number(booking.totalPrice) * 100), // Convert to cents
        currency: "usd",
        metadata: {
          bookingId: booking.id,
          userId: req.user!.id,
          listingTitle: booking.listing.title,
        },
      });

      // Create or update payment record
      const payment = await prisma.payment.upsert({
        where: { bookingId },
        update: {
          stripePaymentId: paymentIntent.id,
          status: "PENDING",
        },
        create: {
          bookingId,
          amount: booking.totalPrice,
          stripePaymentId: paymentIntent.id,
          status: "PENDING",
        },
      });

      res.json({
        success: true,
        data: {
          clientSecret: paymentIntent.client_secret,
          paymentId: payment.id,
        },
      });
    } catch (error) {
      console.error("Create payment intent error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create payment intent",
        error: "Internal server error",
      });
    }
  }
);

// Confirm payment
router.post("/confirm", authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { paymentIntentId, bookingId } = req.body;

    // Verify payment with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      res.status(400).json({
        success: false,
        message: "Payment not successful",
      });
      return;
    }

    // Update payment status
    const payment = await prisma.payment.update({
      where: { bookingId },
      data: { status: "COMPLETED" },
    });

    // Update booking status
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CONFIRMED" },
      include: {
        listing: {
          select: {
            title: true,
            location: true,
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
    });

    res.json({
      success: true,
      message: "Payment confirmed successfully",
      data: {
        payment,
        booking,
      },
    });
  } catch (error) {
    console.error("Confirm payment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to confirm payment",
      error: "Internal server error",
    });
  }
});

// Get payment details
router.get("/:bookingId", authenticateUser, async (req: AuthRequest, res) => {
  try {
    const { bookingId } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { bookingId },
      include: {
        booking: {
          include: {
            listing: {
              select: {
                title: true,
                location: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      res.status(404).json({
        success: false,
        message: "Payment not found",
      });
      return;
    }

    if (payment.booking.userId !== req.user!.id) {
      res.status(403).json({
        success: false,
        message: "Access denied",
      });
      return;
    }

    res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("Get payment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get payment details",
      error: "Internal server error",
    });
  }
});

// Stripe webhook handler
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig!,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log("Payment succeeded:", paymentIntent.id);

        // Update payment status in database
        try {
          await prisma.payment.updateMany({
            where: { stripePaymentId: paymentIntent.id },
            data: { status: "COMPLETED" },
          });
        } catch (error) {
          console.error("Failed to update payment status:", error);
        }
        break;

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object;
        console.log("Payment failed:", failedPayment.id);

        // Update payment status in database
        try {
          await prisma.payment.updateMany({
            where: { stripePaymentId: failedPayment.id },
            data: { status: "FAILED" },
          });
        } catch (error) {
          console.error("Failed to update payment status:", error);
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  }
);

export default router;
