const express = require("express");
const { body, validationResult } = require("express-validator");
const { query, getClient } = require("../config/database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Create new booking
router.post(
  "/",
  authenticateToken,
  [
    body("propertyId")
      .isInt({ min: 1 })
      .withMessage("Valid property ID is required"),
    body("checkInDate")
      .isISO8601()
      .withMessage("Valid check-in date is required"),
    body("checkOutDate")
      .isISO8601()
      .withMessage("Valid check-out date is required"),
    body("numGuests")
      .isInt({ min: 1 })
      .withMessage("Number of guests must be at least 1"),
  ],
  async (req, res) => {
    const client = await getClient();

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        propertyId,
        checkInDate,
        checkOutDate,
        numGuests,
        specialRequests,
      } = req.body;

      await client.query("BEGIN");

      // Check if property exists and is active
      const propertyResult = await client.query(
        "SELECT * FROM properties WHERE id = $1 AND is_active = true",
        [propertyId]
      );

      if (propertyResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res
          .status(404)
          .json({ error: "Property not found or not available" });
      }

      const property = propertyResult.rows[0];

      // Validate dates
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const today = new Date();

      if (checkIn < today) {
        await client.query("ROLLBACK");
        return res
          .status(400)
          .json({ error: "Check-in date cannot be in the past" });
      }

      if (checkOut <= checkIn) {
        await client.query("ROLLBACK");
        return res
          .status(400)
          .json({ error: "Check-out date must be after check-in date" });
      }

      // Check guest capacity
      if (numGuests > property.max_guests) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: `Property can accommodate maximum ${property.max_guests} guests`,
        });
      }

      // Check availability
      const conflictingBookings = await client.query(
        `
      SELECT id FROM bookings 
      WHERE property_id = $1 
      AND booking_status IN ('confirmed', 'pending')
      AND (
        (check_in_date <= $2 AND check_out_date > $2)
        OR (check_in_date < $3 AND check_out_date >= $3)
        OR (check_in_date >= $2 AND check_out_date <= $3)
      )
    `,
        [propertyId, checkInDate, checkOutDate]
      );

      if (conflictingBookings.rows.length > 0) {
        await client.query("ROLLBACK");
        return res
          .status(400)
          .json({ error: "Property is not available for selected dates" });
      }

      // Calculate total amount
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      const totalAmount = nights * Number.parseFloat(property.price_per_night);

      // Create booking
      const bookingResult = await client.query(
        `
      INSERT INTO bookings (
        property_id, guest_id, check_in_date, check_out_date, 
        num_guests, total_amount, special_requests
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
        [
          propertyId,
          req.user.id,
          checkInDate,
          checkOutDate,
          numGuests,
          totalAmount,
          specialRequests,
        ]
      );

      await client.query("COMMIT");

      res.status(201).json({
        message: "Booking created successfully",
        booking: bookingResult.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Create booking error:", error);
      res.status(500).json({ error: "Failed to create booking" });
    } finally {
      client.release();
    }
  }
);

// Get user's bookings (guest)
router.get("/user", authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `
      SELECT 
        b.*,
        p.title as property_title,
        p.city,
        p.state,
        p.country,
        u.first_name || ' ' || u.last_name as host_name
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN users u ON p.host_id = u.id
      WHERE b.guest_id = $1
      ORDER BY b.created_at DESC
    `,
      [req.user.id]
    );

    const bookings = result.rows.map((row) => ({
      id: row.id,
      propertyTitle: row.property_title,
      location: `${row.city}, ${row.state || row.country}`,
      hostName: row.host_name,
      checkInDate: row.check_in_date,
      checkOutDate: row.check_out_date,
      numGuests: row.num_guests,
      totalAmount: Number.parseFloat(row.total_amount),
      status: row.booking_status,
      paymentStatus: row.payment_status,
      specialRequests: row.special_requests,
      createdAt: row.created_at,
    }));

    res.json(bookings);
  } catch (error) {
    console.error("Get user bookings error:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// Get host's bookings
router.get("/host", authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `
      SELECT 
        b.*,
        p.title as property_title,
        u.first_name || ' ' || u.last_name as guest_name,
        u.email as guest_email
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN users u ON b.guest_id = u.id
      WHERE p.host_id = $1
      ORDER BY b.created_at DESC
    `,
      [req.user.id]
    );

    const bookings = result.rows.map((row) => ({
      id: row.id,
      propertyTitle: row.property_title,
      guestName: row.guest_name,
      guestEmail: row.guest_email,
      checkInDate: row.check_in_date,
      checkOutDate: row.check_out_date,
      numGuests: row.num_guests,
      totalAmount: Number.parseFloat(row.total_amount),
      status: row.booking_status,
      paymentStatus: row.payment_status,
      specialRequests: row.special_requests,
      createdAt: row.created_at,
    }));

    res.json(bookings);
  } catch (error) {
    console.error("Get host bookings error:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// Update booking status (host only)
router.patch(
  "/:id/status",
  authenticateToken,
  [
    body("status")
      .isIn(["pending", "confirmed", "cancelled"])
      .withMessage("Invalid status"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { status } = req.body;

      // Check if booking exists and user is the host
      const bookingCheck = await query(
        `
      SELECT b.*, p.host_id 
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE b.id = $1
    `,
        [id]
      );

      if (bookingCheck.rows.length === 0) {
        return res.status(404).json({ error: "Booking not found" });
      }

      const booking = bookingCheck.rows[0];

      if (booking.host_id !== req.user.id) {
        return res
          .status(403)
          .json({ error: "You can only update bookings for your properties" });
      }

      // Update booking status
      const result = await query(
        `
      UPDATE bookings 
      SET booking_status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `,
        [status, id]
      );

      res.json({
        message: "Booking status updated successfully",
        booking: result.rows[0],
      });
    } catch (error) {
      console.error("Update booking status error:", error);
      res.status(500).json({ error: "Failed to update booking status" });
    }
  }
);

// Cancel booking (guest only, own bookings)
router.patch("/:id/cancel", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if booking exists and belongs to user
    const bookingCheck = await query(
      "SELECT * FROM bookings WHERE id = $1 AND guest_id = $2",
      [id, req.user.id]
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const booking = bookingCheck.rows[0];

    if (booking.booking_status === "cancelled") {
      return res.status(400).json({ error: "Booking is already cancelled" });
    }

    // Check if cancellation is allowed (e.g., not too close to check-in date)
    const checkInDate = new Date(booking.check_in_date);
    const now = new Date();
    const hoursUntilCheckIn = (checkInDate - now) / (1000 * 60 * 60);

    if (hoursUntilCheckIn < 24) {
      return res.status(400).json({
        error: "Cannot cancel booking less than 24 hours before check-in",
      });
    }

    // Update booking status
    const result = await query(
      `
      UPDATE bookings 
      SET booking_status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `,
      [id]
    );

    res.json({
      message: "Booking cancelled successfully",
      booking: result.rows[0],
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
});

// Get booking details
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `
      SELECT 
        b.*,
        p.title as property_title,
        p.address,
        p.city,
        p.state,
        p.country,
        p.check_in_time,
        p.check_out_time,
        host.first_name || ' ' || host.last_name as host_name,
        host.email as host_email,
        guest.first_name || ' ' || guest.last_name as guest_name,
        guest.email as guest_email
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      JOIN users host ON p.host_id = host.id
      JOIN users guest ON b.guest_id = guest.id
      WHERE b.id = $1
    `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const booking = result.rows[0];

    // Check if user is either the guest or the host
    if (booking.guest_id !== req.user.id && booking.host_id !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({
      id: booking.id,
      propertyTitle: booking.property_title,
      address: booking.address,
      location: `${booking.city}, ${booking.state || booking.country}`,
      checkInDate: booking.check_in_date,
      checkOutDate: booking.check_out_date,
      checkInTime: booking.check_in_time,
      checkOutTime: booking.check_out_time,
      numGuests: booking.num_guests,
      totalAmount: Number.parseFloat(booking.total_amount),
      status: booking.booking_status,
      paymentStatus: booking.payment_status,
      specialRequests: booking.special_requests,
      hostName: booking.host_name,
      hostEmail: booking.host_email,
      guestName: booking.guest_name,
      guestEmail: booking.guest_email,
      createdAt: booking.created_at,
    });
  } catch (error) {
    console.error("Get booking details error:", error);
    res.status(500).json({ error: "Failed to fetch booking details" });
  }
});

module.exports = router;
