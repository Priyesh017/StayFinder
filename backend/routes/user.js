const express = require("express");
const { body, validationResult } = require("express-validator");
const { query } = require("../config/database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Get user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `
      SELECT 
        id, email, first_name, last_name, phone, date_of_birth,
        profile_picture, user_type, is_verified, created_at
      FROM users 
      WHERE id = $1
    `,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      dateOfBirth: user.date_of_birth,
      profilePicture: user.profile_picture,
      userType: user.user_type,
      isVerified: user.is_verified,
      memberSince: user.created_at,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Update user profile
router.put(
  "/profile",
  authenticateToken,
  [
    body("firstName")
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage("First name cannot be empty"),
    body("lastName")
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage("Last name cannot be empty"),
    body("phone")
      .optional()
      .isMobilePhone()
      .withMessage("Invalid phone number"),
    body("dateOfBirth")
      .optional()
      .isISO8601()
      .withMessage("Invalid date format"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { firstName, lastName, phone, dateOfBirth, profilePicture } =
        req.body;

      const result = await query(
        `
      UPDATE users 
      SET 
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        phone = COALESCE($3, phone),
        date_of_birth = COALESCE($4, date_of_birth),
        profile_picture = COALESCE($5, profile_picture),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING id, email, first_name, last_name, phone, date_of_birth, profile_picture, user_type
    `,
        [firstName, lastName, phone, dateOfBirth, profilePicture, req.user.id]
      );

      res.json({
        message: "Profile updated successfully",
        user: result.rows[0],
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  }
);

// Get user's favorites
router.get("/favorites", authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `
      SELECT 
        p.*,
        u.first_name || ' ' || u.last_name as host_name,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(r.id) as review_count,
        f.created_at as favorited_at
      FROM favorites f
      JOIN properties p ON f.property_id = p.id
      JOIN users u ON p.host_id = u.id
      LEFT JOIN reviews r ON p.id = r.property_id
      WHERE f.user_id = $1 AND p.is_active = true
      GROUP BY p.id, u.first_name, u.last_name, f.created_at
      ORDER BY f.created_at DESC
    `,
      [req.user.id]
    );

    const favorites = result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      location: `${row.city}, ${row.state || row.country}`,
      price: Number.parseFloat(row.price_per_night),
      rating: Number.parseFloat(row.avg_rating) || 0,
      reviews: Number.parseInt(row.review_count) || 0,
      host: row.host_name,
      type: row.property_type,
      favoritedAt: row.favorited_at,
    }));

    res.json(favorites);
  } catch (error) {
    console.error("Get favorites error:", error);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

// Add property to favorites
router.post("/favorites/:propertyId", authenticateToken, async (req, res) => {
  try {
    const { propertyId } = req.params;

    // Check if property exists
    const propertyCheck = await query(
      "SELECT id FROM properties WHERE id = $1 AND is_active = true",
      [propertyId]
    );

    if (propertyCheck.rows.length === 0) {
      return res.status(404).json({ error: "Property not found" });
    }

    // Check if already favorited
    const existingFavorite = await query(
      "SELECT id FROM favorites WHERE user_id = $1 AND property_id = $2",
      [req.user.id, propertyId]
    );

    if (existingFavorite.rows.length > 0) {
      return res.status(400).json({ error: "Property already in favorites" });
    }

    // Add to favorites
    await query(
      "INSERT INTO favorites (user_id, property_id) VALUES ($1, $2)",
      [req.user.id, propertyId]
    );

    res.status(201).json({ message: "Property added to favorites" });
  } catch (error) {
    console.error("Add favorite error:", error);
    res.status(500).json({ error: "Failed to add favorite" });
  }
});

// Remove property from favorites
router.delete("/favorites/:propertyId", authenticateToken, async (req, res) => {
  try {
    const { propertyId } = req.params;

    const result = await query(
      "DELETE FROM favorites WHERE user_id = $1 AND property_id = $2",
      [req.user.id, propertyId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Favorite not found" });
    }

    res.json({ message: "Property removed from favorites" });
  } catch (error) {
    console.error("Remove favorite error:", error);
    res.status(500).json({ error: "Failed to remove favorite" });
  }
});

// Get user statistics (for dashboard)
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    const stats = {};

    // Get booking stats
    const bookingStats = await query(
      `
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(*) FILTER (WHERE booking_status = 'completed') as completed_bookings,
        COUNT(*) FILTER (WHERE booking_status = 'confirmed') as upcoming_bookings,
        COALESCE(SUM(total_amount) FILTER (WHERE booking_status = 'completed'), 0) as total_spent
      FROM bookings 
      WHERE guest_id = $1
    `,
      [req.user.id]
    );

    stats.bookings = {
      total: Number.parseInt(bookingStats.rows[0].total_bookings) || 0,
      completed: Number.parseInt(bookingStats.rows[0].completed_bookings) || 0,
      upcoming: Number.parseInt(bookingStats.rows[0].upcoming_bookings) || 0,
      totalSpent: Number.parseFloat(bookingStats.rows[0].total_spent) || 0,
    };

    // Get hosting stats if user is a host
    if (req.user.user_type === "host" || req.user.user_type === "both") {
      const hostingStats = await query(
        `
        SELECT 
          COUNT(DISTINCT p.id) as total_properties,
          COUNT(DISTINCT p.id) FILTER (WHERE p.is_active = true) as active_properties,
          COUNT(DISTINCT b.id) as total_bookings,
          COALESCE(SUM(b.total_amount) FILTER (WHERE b.booking_status = 'completed'), 0) as total_earned
        FROM properties p
        LEFT JOIN bookings b ON p.id = b.property_id
        WHERE p.host_id = $1
      `,
        [req.user.id]
      );

      stats.hosting = {
        totalProperties:
          Number.parseInt(hostingStats.rows[0].total_properties) || 0,
        activeProperties:
          Number.parseInt(hostingStats.rows[0].active_properties) || 0,
        totalBookings:
          Number.parseInt(hostingStats.rows[0].total_bookings) || 0,
        totalEarned: Number.parseFloat(hostingStats.rows[0].total_earned) || 0,
      };
    }

    // Get review stats
    const reviewStats = await query(
      `
      SELECT 
        COUNT(*) as reviews_given,
        COALESCE(AVG(rating), 0) as avg_rating_given
      FROM reviews 
      WHERE reviewer_id = $1
    `,
      [req.user.id]
    );

    stats.reviews = {
      given: Number.parseInt(reviewStats.rows[0].reviews_given) || 0,
      averageRating:
        Number.parseFloat(reviewStats.rows[0].avg_rating_given) || 0,
    };

    res.json(stats);
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({ error: "Failed to fetch user statistics" });
  }
});

module.exports = router;
