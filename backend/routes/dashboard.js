const express = require("express");
const { query } = require("../config/database");
const { authenticateToken, requireHost } = require("../middleware/auth");

const router = express.Router();

// Get dashboard statistics for hosts
router.get("/stats", authenticateToken, requireHost, async (req, res) => {
  try {
    const hostId = req.user.id;

    // Get revenue stats
    const revenueResult = await query(
      `
      SELECT 
        COALESCE(SUM(b.total_amount) FILTER (WHERE b.booking_status = 'completed'), 0) as total_revenue,
        COALESCE(SUM(b.total_amount) FILTER (WHERE b.booking_status = 'completed' AND EXTRACT(MONTH FROM b.created_at) = EXTRACT(MONTH FROM CURRENT_DATE)), 0) as monthly_revenue,
        COALESCE(SUM(b.total_amount) FILTER (WHERE b.booking_status = 'completed' AND EXTRACT(MONTH FROM b.created_at) = EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month')), 0) as last_month_revenue
      FROM properties p
      LEFT JOIN bookings b ON p.id = b.property_id
      WHERE p.host_id = $1
    `,
      [hostId]
    );

    // Get property stats
    const propertyResult = await query(
      `
      SELECT 
        COUNT(*) as total_properties,
        COUNT(*) FILTER (WHERE is_active = true) as active_properties
      FROM properties
      WHERE host_id = $1
    `,
      [hostId]
    );

    // Get booking stats
    const bookingResult = await query(
      `
      SELECT 
        COUNT(DISTINCT b.id) as total_bookings,
        COUNT(DISTINCT b.id) FILTER (WHERE EXTRACT(MONTH FROM b.created_at) = EXTRACT(MONTH FROM CURRENT_DATE)) as monthly_bookings,
        COUNT(DISTINCT b.id) FILTER (WHERE EXTRACT(MONTH FROM b.created_at) = EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '1 month')) as last_month_bookings
      FROM properties p
      LEFT JOIN bookings b ON p.id = b.property_id
      WHERE p.host_id = $1
    `,
      [hostId]
    );

    // Get rating stats
    const ratingResult = await query(
      `
      SELECT 
        COALESCE(AVG(r.rating), 0) as avg_rating
      FROM properties p
      LEFT JOIN reviews r ON p.id = r.property_id
      WHERE p.host_id = $1
    `,
      [hostId]
    );

    const revenue = revenueResult.rows[0];
    const properties = propertyResult.rows[0];
    const bookings = bookingResult.rows[0];
    const rating = ratingResult.rows[0];

    // Calculate percentage changes
    const revenueChange =
      revenue.last_month_revenue > 0
        ? (
            ((revenue.monthly_revenue - revenue.last_month_revenue) /
              revenue.last_month_revenue) *
            100
          ).toFixed(1)
        : revenue.monthly_revenue > 0
        ? 100
        : 0;

    const bookingChange =
      bookings.last_month_bookings > 0
        ? (
            ((bookings.monthly_bookings - bookings.last_month_bookings) /
              bookings.last_month_bookings) *
            100
          ).toFixed(1)
        : bookings.monthly_bookings > 0
        ? 100
        : 0;

    res.json({
      revenue: {
        total: Number.parseFloat(revenue.total_revenue),
        monthly: Number.parseFloat(revenue.monthly_revenue),
        change: `${revenueChange >= 0 ? "+" : ""}${revenueChange}%`,
        trend: revenueChange >= 0 ? "up" : "down",
      },
      properties: {
        total: Number.parseInt(properties.total_properties),
        active: Number.parseInt(properties.active_properties),
        change: `+${Number.parseInt(properties.active_properties)}`,
        trend: "up",
      },
      bookings: {
        total: Number.parseInt(bookings.total_bookings),
        monthly: Number.parseInt(bookings.monthly_bookings),
        change: `${bookingChange >= 0 ? "+" : ""}${bookingChange}%`,
        trend: bookingChange >= 0 ? "up" : "down",
      },
      rating: {
        average: Number.parseFloat(rating.avg_rating).toFixed(1),
        change: "+0.2",
        trend: "up",
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
});

module.exports = router;
