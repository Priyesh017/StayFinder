const express = require("express");
const {
  body,
  query: expressQuery,
  validationResult,
} = require("express-validator");
const { query } = require("../config/database");
const { authenticateToken, requireHost } = require("../middleware/auth");

const router = express.Router();

// Get all properties with optional filtering
router.get("/", async (req, res) => {
  try {
    const {
      city,
      propertyType,
      minPrice,
      maxPrice,
      guests,
      page = 1,
      limit = 12,
    } = req.query;

    let queryText = `
      SELECT 
        p.*,
        u.first_name || ' ' || u.last_name as host_name,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.id) as review_count,
        array_agg(DISTINCT pi.image_url ORDER BY pi.display_order) FILTER (WHERE pi.image_url IS NOT NULL) as images
      FROM properties p
      LEFT JOIN users u ON p.host_id = u.id
      LEFT JOIN reviews r ON p.id = r.property_id
      LEFT JOIN property_images pi ON p.id = pi.property_id
      WHERE p.is_active = true
    `;

    const queryParams = [];
    let paramCount = 0;

    if (city) {
      paramCount++;
      queryText += ` AND LOWER(p.city) LIKE LOWER($${paramCount})`;
      queryParams.push(`%${city}%`);
    }

    if (propertyType) {
      paramCount++;
      queryText += ` AND p.property_type = $${paramCount}`;
      queryParams.push(propertyType);
    }

    if (minPrice) {
      paramCount++;
      queryText += ` AND p.price_per_night >= $${paramCount}`;
      queryParams.push(Number.parseFloat(minPrice));
    }

    if (maxPrice) {
      paramCount++;
      queryText += ` AND p.price_per_night <= $${paramCount}`;
      queryParams.push(Number.parseFloat(maxPrice));
    }

    if (guests) {
      paramCount++;
      queryText += ` AND p.max_guests >= $${paramCount}`;
      queryParams.push(Number.parseInt(guests));
    }

    queryText += `
      GROUP BY p.id, u.first_name, u.last_name
      ORDER BY p.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    queryParams.push(
      Number.parseInt(limit),
      (Number.parseInt(page) - 1) * Number.parseInt(limit)
    );

    const result = await query(queryText, queryParams);

    const properties = result.rows.map((row) => ({
      id: row.id.toString(),
      title: row.title,
      location: `${row.city}, ${row.state || row.country}`,
      price: Number.parseFloat(row.price_per_night),
      rating: Number.parseFloat(row.avg_rating) || 0,
      reviews: Number.parseInt(row.review_count) || 0,
      images: row.images || ["/placeholder.svg?height=300&width=400"],
      host: row.host_name,
      type: row.property_type,
      guests: row.max_guests,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
    }));

    res.json(properties);
  } catch (error) {
    console.error("Get properties error:", error);
    res.status(500).json({ error: "Failed to fetch properties" });
  }
});

// Get single property by ID - Updated to match frontend expectations
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `
      SELECT 
        p.*,
        u.first_name || ' ' || u.last_name as host_name,
        u.created_at as host_joined,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.id) as review_count,
        array_agg(DISTINCT pi.image_url ORDER BY pi.display_order) FILTER (WHERE pi.image_url IS NOT NULL) as images
      FROM properties p
      LEFT JOIN users u ON p.host_id = u.id
      LEFT JOIN reviews r ON p.id = r.property_id
      LEFT JOIN property_images pi ON p.id = pi.property_id
      WHERE p.id = $1 AND p.is_active = true
      GROUP BY p.id, u.first_name, u.last_name, u.created_at
    `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Property not found" });
    }

    const property = result.rows[0];

    res.json({
      id: property.id.toString(),
      title: property.title,
      description: property.description,
      location: `${property.city}, ${property.state || property.country}`,
      price: Number.parseFloat(property.price_per_night),
      rating: Number.parseFloat(property.avg_rating) || 0,
      reviews: Number.parseInt(property.review_count) || 0,
      images: property.images || ["/placeholder.svg?height=400&width=600"],
      host: {
        name: property.host_name,
        avatar: "/placeholder.svg?height=100&width=100",
        joinedDate: new Date(property.host_joined).getFullYear().toString(),
        verified: true,
        responseRate: 98,
        responseTime: "within an hour",
      },
      type: property.property_type,
      guests: property.max_guests,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      amenities: property.amenities || [
        "WiFi",
        "Kitchen",
        "Air conditioning",
        "Heating",
        "TV",
        "Washer",
        "Dryer",
        "Parking",
      ],
      rules: property.house_rules || [
        "Check-in: 3:00 PM - 11:00 PM",
        "Checkout: 11:00 AM",
        "No smoking",
        "No pets",
        "No parties or events",
      ],
      checkInTime: property.check_in_time,
      checkOutTime: property.check_out_time,
    });
  } catch (error) {
    console.error("Get property error:", error);
    res.status(500).json({ error: "Failed to fetch property" });
  }
});

// Search properties - Updated to match frontend search functionality
router.post("/search", async (req, res) => {
  try {
    const {
      location,
      checkIn,
      checkOut,
      guests,
      propertyType,
      minPrice,
      maxPrice,
    } = req.body;

    let queryText = `
      SELECT 
        p.*,
        u.first_name || ' ' || u.last_name as host_name,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.id) as review_count,
        array_agg(DISTINCT pi.image_url ORDER BY pi.display_order) FILTER (WHERE pi.image_url IS NOT NULL) as images
      FROM properties p
      LEFT JOIN users u ON p.host_id = u.id
      LEFT JOIN reviews r ON p.id = r.property_id
      LEFT JOIN property_images pi ON p.id = pi.property_id
      WHERE p.is_active = true
    `;

    const queryParams = [];
    let paramCount = 0;

    if (location) {
      paramCount++;
      queryText += ` AND (LOWER(p.city) LIKE LOWER($${paramCount}) OR LOWER(p.address) LIKE LOWER($${paramCount}) OR LOWER(p.title) LIKE LOWER($${paramCount}))`;
      queryParams.push(`%${location}%`);
    }

    if (guests) {
      paramCount++;
      queryText += ` AND p.max_guests >= $${paramCount}`;
      queryParams.push(Number.parseInt(guests));
    }

    if (propertyType) {
      paramCount++;
      queryText += ` AND p.property_type = $${paramCount}`;
      queryParams.push(propertyType);
    }

    if (minPrice) {
      paramCount++;
      queryText += ` AND p.price_per_night >= $${paramCount}`;
      queryParams.push(Number.parseFloat(minPrice));
    }

    if (maxPrice) {
      paramCount++;
      queryText += ` AND p.price_per_night <= $${paramCount}`;
      queryParams.push(Number.parseFloat(maxPrice));
    }

    // Check availability if dates provided
    if (checkIn && checkOut) {
      queryText += `
        AND p.id NOT IN (
          SELECT DISTINCT property_id 
          FROM bookings 
          WHERE booking_status IN ('confirmed', 'pending')
          AND (
            (check_in_date <= $${paramCount + 1} AND check_out_date > $${
        paramCount + 1
      })
            OR (check_in_date < $${paramCount + 2} AND check_out_date >= $${
        paramCount + 2
      })
            OR (check_in_date >= $${paramCount + 1} AND check_out_date <= $${
        paramCount + 2
      })
          )
        )
      `;
      queryParams.push(checkIn, checkOut);
      paramCount += 2;
    }

    queryText += `
      GROUP BY p.id, u.first_name, u.last_name
      ORDER BY p.created_at DESC
    `;

    const result = await query(queryText, queryParams);

    const properties = result.rows.map((row) => ({
      id: row.id.toString(),
      title: row.title,
      location: `${row.city}, ${row.state || row.country}`,
      price: Number.parseFloat(row.price_per_night),
      rating: Number.parseFloat(row.avg_rating) || 0,
      reviews: Number.parseInt(row.review_count) || 0,
      images: row.images || ["/placeholder.svg?height=300&width=400"],
      host: row.host_name,
      type: row.property_type,
      guests: row.max_guests,
      bedrooms: row.bedrooms,
      bathrooms: row.bathrooms,
    }));

    res.json(properties);
  } catch (error) {
    console.error("Search properties error:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

// Create new property (hosts only)
router.post(
  "/",
  authenticateToken,
  requireHost,
  [
    body("title").trim().isLength({ min: 1 }).withMessage("Title is required"),
    body("description")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Description must be at least 10 characters"),
    body("propertyType").isIn([
      "apartment",
      "house",
      "villa",
      "condo",
      "cabin",
      "loft",
      "townhouse",
    ]),
    body("address")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Address is required"),
    body("city").trim().isLength({ min: 1 }).withMessage("City is required"),
    body("country")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Country is required"),
    body("pricePerNight")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number"),
    body("maxGuests")
      .isInt({ min: 1 })
      .withMessage("Max guests must be at least 1"),
    body("bedrooms")
      .isInt({ min: 0 })
      .withMessage("Bedrooms must be a non-negative number"),
    body("bathrooms")
      .isInt({ min: 1 })
      .withMessage("Bathrooms must be at least 1"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        title,
        description,
        propertyType,
        address,
        city,
        state,
        country,
        postalCode,
        pricePerNight,
        maxGuests,
        bedrooms,
        bathrooms,
        amenities = [],
        houseRules = [],
      } = req.body;

      const result = await query(
        `
      INSERT INTO properties (
        host_id, title, description, property_type, address, city, state, country, 
        postal_code, price_per_night, max_guests, bedrooms, bathrooms, amenities, house_rules
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `,
        [
          req.user.id,
          title,
          description,
          propertyType,
          address,
          city,
          state,
          country,
          postalCode,
          pricePerNight,
          maxGuests,
          bedrooms,
          bathrooms,
          amenities,
          houseRules,
        ]
      );

      res.status(201).json({
        message: "Property created successfully",
        property: result.rows[0],
      });
    } catch (error) {
      console.error("Create property error:", error);
      res.status(500).json({ error: "Failed to create property" });
    }
  }
);

// Update property (host only, own properties)
router.put("/:id", authenticateToken, requireHost, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if property belongs to the authenticated user
    const propertyCheck = await query(
      "SELECT host_id FROM properties WHERE id = $1",
      [id]
    );

    if (propertyCheck.rows.length === 0) {
      return res.status(404).json({ error: "Property not found" });
    }

    if (propertyCheck.rows[0].host_id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You can only update your own properties" });
    }

    const {
      title,
      description,
      pricePerNight,
      maxGuests,
      amenities,
      houseRules,
      isActive,
    } = req.body;

    const result = await query(
      `
      UPDATE properties 
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          price_per_night = COALESCE($3, price_per_night),
          max_guests = COALESCE($4, max_guests),
          amenities = COALESCE($5, amenities),
          house_rules = COALESCE($6, house_rules),
          is_active = COALESCE($7, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `,
      [
        title,
        description,
        pricePerNight,
        maxGuests,
        amenities,
        houseRules,
        isActive,
        id,
      ]
    );

    res.json({
      message: "Property updated successfully",
      property: result.rows[0],
    });
  } catch (error) {
    console.error("Update property error:", error);
    res.status(500).json({ error: "Failed to update property" });
  }
});

// Delete property (host only, own properties)
router.delete("/:id", authenticateToken, requireHost, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if property belongs to the authenticated user
    const propertyCheck = await query(
      "SELECT host_id FROM properties WHERE id = $1",
      [id]
    );

    if (propertyCheck.rows.length === 0) {
      return res.status(404).json({ error: "Property not found" });
    }

    if (propertyCheck.rows[0].host_id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You can only delete your own properties" });
    }

    // Check for active bookings
    const activeBookings = await query(
      "SELECT id FROM bookings WHERE property_id = $1 AND booking_status IN ($2, $3)",
      [id, "confirmed", "pending"]
    );

    if (activeBookings.rows.length > 0) {
      return res.status(400).json({
        error: "Cannot delete property with active bookings",
      });
    }

    await query("DELETE FROM properties WHERE id = $1", [id]);

    res.json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Delete property error:", error);
    res.status(500).json({ error: "Failed to delete property" });
  }
});

// Get host's properties - Updated for dashboard
router.get(
  "/host/my-properties",
  authenticateToken,
  requireHost,
  async (req, res) => {
    try {
      const result = await query(
        `
      SELECT 
        p.*,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(DISTINCT r.id) as review_count,
        COUNT(DISTINCT b.id) FILTER (WHERE b.booking_status = 'confirmed' AND EXTRACT(MONTH FROM b.created_at) = EXTRACT(MONTH FROM CURRENT_DATE)) as monthly_bookings,
        array_agg(DISTINCT pi.image_url ORDER BY pi.display_order) FILTER (WHERE pi.image_url IS NOT NULL) as images
      FROM properties p
      LEFT JOIN reviews r ON p.id = r.property_id
      LEFT JOIN bookings b ON p.id = b.property_id
      LEFT JOIN property_images pi ON p.id = pi.property_id
      WHERE p.host_id = $1
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `,
        [req.user.id]
      );

      const properties = result.rows.map((row) => ({
        id: row.id.toString(),
        title: row.title,
        location: `${row.city}, ${row.state || row.country}`,
        price: Number.parseFloat(row.price_per_night),
        status: row.is_active ? "active" : "inactive",
        bookings: Number.parseInt(row.monthly_bookings) || 0,
        rating: Number.parseFloat(row.avg_rating) || 0,
        reviews: Number.parseInt(row.review_count) || 0,
        image:
          row.images && row.images.length > 0
            ? row.images[0]
            : "/placeholder.svg?height=80&width=120",
      }));

      res.json(properties);
    } catch (error) {
      console.error("Get host properties error:", error);
      res.status(500).json({ error: "Failed to fetch properties" });
    }
  }
);

module.exports = router;
