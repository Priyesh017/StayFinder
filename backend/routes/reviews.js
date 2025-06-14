const express = require("express");
const { body, validationResult } = require("express-validator");
const { query } = require("../config/database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Create review (guest only, after completed stay)
router.post(
  "/",
  authenticateToken,
  [
    body("bookingId")
      .isInt({ min: 1 })
      .withMessage("Valid booking ID is required"),
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("comment")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Comment too long"),
    body("cleanlinessRating").optional().isInt({ min: 1, max: 5 }),
    body("accuracyRating").optional().isInt({ min: 1, max: 5 }),
    body("communicationRating").optional().isInt({ min: 1, max: 5 }),
    body("locationRating").optional().isInt({ min: 1, max: 5 }),
    body("valueRating").optional().isInt({ min: 1, max: 5 }),
    body("checkinRating").optional().isInt({ min: 1, max: 5 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        bookingId,
        rating,
        comment,
        cleanlinessRating,
        accuracyRating,
        communicationRating,
        locationRating,
        valueRating,
        checkinRating,
      } = req.body;

      // Check if booking exists and belongs to user
      const bookingResult = await query(
        `
      SELECT b.*, p.id as property_id
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = $1 AND b.guest_id = $2
    `,
        [bookingId, req.user.id]
      );

      if (bookingResult.rows.length === 0) {
        return res.status(404).json({ error: "Booking not found" });
      }

      const booking = bookingResult.rows[0];

      // Check if booking is completed
      if (booking.booking_status !== "completed") {
        return res
          .status(400)
          .json({ error: "Can only review completed stays" });
      }

      // Check if review already exists
      const existingReview = await query(
        "SELECT id FROM reviews WHERE booking_id = $1",
        [bookingId]
      );

      if (existingReview.rows.length > 0) {
        return res
          .status(400)
          .json({ error: "Review already exists for this booking" });
      }

      // Create review
      const result = await query(
        `
      INSERT INTO reviews (
        booking_id, reviewer_id, property_id, rating, comment,
        cleanliness_rating, accuracy_rating, communication_rating,
        location_rating, value_rating, checkin_rating
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `,
        [
          bookingId,
          req.user.id,
          booking.property_id,
          rating,
          comment,
          cleanlinessRating,
          accuracyRating,
          communicationRating,
          locationRating,
          valueRating,
          checkinRating,
        ]
      );

      res.status(201).json({
        message: "Review created successfully",
        review: result.rows[0],
      });
    } catch (error) {
      console.error("Create review error:", error);
      res.status(500).json({ error: "Failed to create review" });
    }
  }
);

// Get reviews for a property
router.get("/property/:propertyId", async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await query(
      `
      SELECT 
        r.*,
        u.first_name || ' ' || u.last_name as reviewer_name
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      WHERE r.property_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `,
      [
        propertyId,
        Number.parseInt(limit),
        (Number.parseInt(page) - 1) * Number.parseInt(limit),
      ]
    );

    const reviews = result.rows.map((row) => ({
      id: row.id,
      rating: row.rating,
      comment: row.comment,
      reviewerName: row.reviewer_name,
      createdAt: row.created_at,
      ratings: {
        cleanliness: row.cleanliness_rating,
        accuracy: row.accuracy_rating,
        communication: row.communication_rating,
        location: row.location_rating,
        value: row.value_rating,
        checkin: row.checkin_rating,
      },
    }));

    // Get total count and average ratings
    const statsResult = await query(
      `
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as avg_rating,
        AVG(cleanliness_rating) as avg_cleanliness,
        AVG(accuracy_rating) as avg_accuracy,
        AVG(communication_rating) as avg_communication,
        AVG(location_rating) as avg_location,
        AVG(value_rating) as avg_value,
        AVG(checkin_rating) as avg_checkin
      FROM reviews
      WHERE property_id = $1
    `,
      [propertyId]
    );

    const stats = statsResult.rows[0];

    res.json({
      reviews,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total: Number.parseInt(stats.total_reviews),
        pages: Math.ceil(stats.total_reviews / limit),
      },
      averageRatings: {
        overall: Number.parseFloat(stats.avg_rating) || 0,
        cleanliness: Number.parseFloat(stats.avg_cleanliness) || 0,
        accuracy: Number.parseFloat(stats.avg_accuracy) || 0,
        communication: Number.parseFloat(stats.avg_communication) || 0,
        location: Number.parseFloat(stats.avg_location) || 0,
        value: Number.parseFloat(stats.avg_value) || 0,
        checkin: Number.parseFloat(stats.avg_checkin) || 0,
      },
    });
  } catch (error) {
    console.error("Get property reviews error:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// Get user's reviews
router.get("/user", authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `
      SELECT 
        r.*,
        p.title as property_title,
        p.city,
        p.state,
        p.country
      FROM reviews r
      JOIN properties p ON r.property_id = p.id
      WHERE r.reviewer_id = $1
      ORDER BY r.created_at DESC
    `,
      [req.user.id]
    );

    const reviews = result.rows.map((row) => ({
      id: row.id,
      propertyTitle: row.property_title,
      location: `${row.city}, ${row.state || row.country}`,
      rating: row.rating,
      comment: row.comment,
      createdAt: row.created_at,
    }));

    res.json(reviews);
  } catch (error) {
    console.error("Get user reviews error:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// Update review (reviewer only)
router.put(
  "/:id",
  authenticateToken,
  [
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("comment")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Comment too long"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { rating, comment } = req.body;

      // Check if review exists and belongs to user
      const reviewCheck = await query(
        "SELECT * FROM reviews WHERE id = $1 AND reviewer_id = $2",
        [id, req.user.id]
      );

      if (reviewCheck.rows.length === 0) {
        return res.status(404).json({ error: "Review not found" });
      }

      // Update review
      const result = await query(
        `
      UPDATE reviews 
      SET rating = $1, comment = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `,
        [rating, comment, id]
      );

      res.json({
        message: "Review updated successfully",
        review: result.rows[0],
      });
    } catch (error) {
      console.error("Update review error:", error);
      res.status(500).json({ error: "Failed to update review" });
    }
  }
);

// Delete review (reviewer only)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if review exists and belongs to user
    const reviewCheck = await query(
      "SELECT * FROM reviews WHERE id = $1 AND reviewer_id = $2",
      [id, req.user.id]
    );

    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    await query("DELETE FROM reviews WHERE id = $1", [id]);

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

module.exports = router;
